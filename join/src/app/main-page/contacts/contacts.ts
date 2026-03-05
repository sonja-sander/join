import { Component, DoCheck, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';
import { ContactFormData } from '../../shared/interfaces/contact-form-data';
import { capitalizeFullname, setUserColor } from '../../shared/utilities/utils';
import { AuthService } from '../../shared/services/auth-service';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo, ContactDialog],
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
  private readonly mobileMaxWidth = 768;
  private lastContactsVersion = 0;

  isMobile: boolean = false;
  isDetailOpen: boolean = false;
  activeContactID: string | null = null;
  activeContact: Contact | null = null;
  toastVisible: boolean = false;
  showDeleteConfirm: boolean = false;
  contactToDelete: Contact | null = null;

  @ViewChild(ContactDialog) dialog!: ContactDialog;
  @ViewChild('confirmDialog') confirmDialog!: ElementRef<HTMLDialogElement>;

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
   * Creates a new contact from form data.
   *
   * Sets the created contact as active and
   * opens the detail view on mobile devices.
   *
   * @param data The form data used to create the contact
   * @returns Promise<void>
   */
  async createContactFromForm(data: ContactFormData): Promise<void> {
    const contact: Contact = {
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: true,
      userColor: setUserColor(),
    };

    const newContactId = await this.firebaseService.addDocument(contact);
    this.showToast();

    if (!newContactId) return;

    const createdContact: Contact = {
      ...contact,
      id: newContactId,
    };

    this.activeContactID = newContactId;
    this.activeContact = createdContact;

    if (this.isMobile) {
      this.isDetailOpen = true;
    }
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
    this.confirmDialog.nativeElement.showModal();
    this.confirmDialog.nativeElement.classList.add('opened');
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

    this.confirmDialog.nativeElement.close();
    this.confirmDialog.nativeElement.classList.remove('opened');
  }

  /**
   * Cancels the delete confirmation dialog.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.contactToDelete = null;
    this.confirmDialog.nativeElement.close();
    this.confirmDialog.nativeElement.classList.remove('opened');
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
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 2000);
  }
}
