import { Component, DoCheck, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';
import { ContactFormData } from '../../shared/interfaces/contact-form-data';
import { capitalizeFullname, setUserColor } from '../../shared/utilities/utils';
import { AuthService } from '../../shared/services/auth-service';
import { Toast } from '../../shared/components/toast/toast';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo, ContactDialog, Toast, ConfirmDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
/**
 * Contacts component
 *
 * Acts as the main container for the contacts page.
 * Coordinates list, detail, dialog, and deletion flows
 * and manages responsive behavior.
 */
export class Contacts implements DoCheck {
  firebaseService = inject(FirebaseService);
  authService = inject(AuthService);
  @ViewChild(ContactDialog) dialog!: ContactDialog;
  @ViewChild('confirmDialog') confirmDialog!: ElementRef<HTMLDialogElement>;
  private readonly mobileMaxWidth: number = 768;
  private lastContactsVersion: number = 0;
  isMobile: boolean = false;
  isDetailOpen: boolean = false;
  activeContactID: string | null = null;
  activeContact: Contact | null = null;
  addContactSuccess: boolean = false;
  showDeleteConfirm: boolean = false;
  contactToDelete: Contact | null = null;

  constructor() {
    this.updateIsMobile();
  }

  /**
   * Detects changes to the contacts collection.
   *
   * Keeps the active contact in sync when
   * contact data is updated externally.
   *
   * @returns void
   */
  ngDoCheck(): void {
    if (this.lastContactsVersion === this.firebaseService.contactsVersion) return;
    this.lastContactsVersion = this.firebaseService.contactsVersion;
    if (!this.activeContactID) return;

    const updatedContact = this.firebaseService.contacts.find(
      (contact) => contact.id === this.activeContactID,
    );

    if (!updatedContact) return;
    this.activeContact = updatedContact;
  }

  /**
   * Updates the responsive state on viewport resize.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.updateIsMobile();
  }

  /**
   * Updates the mobile state based on the viewport width.
   *
   * @returns void
   */
  private updateIsMobile(): void {
    this.isMobile = window.innerWidth <= this.mobileMaxWidth;
  }

  /**
   * Sets the active contact and opens the detail view.
   *
   * @param selection The selected contact and its identifier
   * @returns void
   */
  setActiveContact(selection: { id: string; contact: Contact }): void {
    this.activeContactID = selection.id;
    this.activeContact = selection.contact;
    this.isDetailOpen = true;
  }

  /**
   * Closes the contact detail view.
   *
   * @returns void
   */
  closeContactInfo(): void {
    this.isDetailOpen = false;
  }

  /**
   * Prevents the default browser context menu.
   *
   * @param event The context menu event
   * @returns void
   */
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  /**
   * Opens the dialog for creating a new contact.
   *
   * @returns void
   */
  openAddDialog(): void {
    this.dialog.openAddDialog();
  }

  /**
   * Opens the edit dialog for a specific contact.
   *
   * @param contact The contact to edit
   * @returns void
   */
  openEditDialog(contact: Contact): void {
    this.activeContact = contact;
    this.dialog.openEditDialog(contact);
  }

  /**
   * Handles saving of the contact form.
   *
   * Creates a new contact or updates an existing one
   * depending on the dialog mode.
   *
   * @param formData The submitted contact form data
   * @returns Promise<void>
   */
  async onSave(formData: ContactFormData): Promise<void> {
    if (this.dialog.dialogMode === 'add') {
      await this.createContactFromForm(formData);
    } else {
      this.updateContactFromForm(formData);
    }
  }

    /**
   * Creates a new contact from submitted form data.
   *
   * Builds the contact object, saves it to the database,
   * and sets the created contact as the active contact.
   *
   * @param data The submitted contact form data
   * @returns Promise<void>
   */
  async createContactFromForm(data: ContactFormData): Promise<void> {
    const contact = this.buildContactFromForm(data);
    const newContactId = await this.saveContact(contact);
    if (!newContactId) return;

    const createdContact: Contact = {
      ...contact,
      id: newContactId,
    };

    this.setActiveContact({
      id: newContactId,
      contact: createdContact,
    });
  }

  /**
   * Builds a contact object from form data.
   *
   * Normalizes the contact name and assigns
   * default values such as availability and color.
   *
   * @param data The submitted contact form data
   * @returns The constructed contact object
   */
  private buildContactFromForm(data: ContactFormData): Contact {
    return {
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: true,
      userColor: setUserColor(),
      avatar: data.avatar
    };
  }

  /**
   * Persists a contact to the database.
   *
   * Displays a confirmation toast after saving
   * and returns the created contact identifier.
   *
   * @param contact The contact to save
   * @returns The identifier of the created contact or null
   */
  private async saveContact(contact: Contact): Promise<string | null> {
    const newContactId = await this.firebaseService.addDocument(contact);
    this.showToast();
    return newContactId ?? null;
  }

  /**
   * Updates the currently active contact using form data.
   *
   * @param data The updated contact form data
   * @returns void
   */
  updateContactFromForm(data: ContactFormData): void {
    if (!this.activeContact) return;

    const contact: Contact = {
      id: this.activeContact.id,
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: this.activeContact.isAvailable,
      userColor: this.activeContact.userColor,
      avatar: data.avatar
    };

    this.firebaseService.updateDocument(contact, 'contacts');
    this.activeContact = contact;
    this.activeContactID = contact.id ?? null;
  }

  /**
   * Requests deletion of a contact.
   *
   * Opens the confirmation dialog if deletion is allowed.
   *
   * @param contact The contact to delete
   * @returns void
   */
  requestDelete(contact: Contact): void {
    if (!this.canDeleteContact(contact)) return;

    this.contactToDelete = contact;
    this.showDeleteConfirm = true;
  }

  /**
   * Confirms deletion of the selected contact.
   *
   * Removes the contact and resets related UI state.
   *
   * @returns void
   */
  confirmDelete(): void {
    if (!this.contactToDelete?.id) return;

    this.firebaseService.deleteDocument('contacts', this.contactToDelete.id);

    this.activeContact = null;
    this.activeContactID = null;
    this.isDetailOpen = false;
    this.contactToDelete = null;
    this.showDeleteConfirm = false;
    this.dialog.closeDialog();
  }

  /**
   * Cancels the delete confirmation dialog.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.contactToDelete = null;
    this.showDeleteConfirm = false;
  }

  /**
   * Determines whether a contact can be deleted.
   *
   * Prevents deletion of the currently logged-in user.
   *
   * @param contact The contact to evaluate
   * @returns True if the contact can be deleted
   */
  canDeleteContact(contact: Contact | null): boolean {
    if (!contact) return false;

    const currentUserEmail = this.normalizeEmail(
      this.authService.firebaseAuth.currentUser?.email,
    );
    const contactEmail = this.normalizeEmail(contact.email);

    if (!currentUserEmail) return true;
    return currentUserEmail !== contactEmail;
  }

  /**
   * Normalizes email values for comparison.
   *
   * @param email The email value to normalize
   * @returns A normalized email string
   */
  private normalizeEmail(email: string | null | undefined): string {
    return String(email ?? '').trim().toLowerCase();
  }

  /**
   * Displays a temporary toast notification.
   *
   * @returns void
   */
  showToast(): void {
    this.addContactSuccess = true;

    setTimeout(() => {
      this.addContactSuccess = false;
    }, 2000);
  }
}
