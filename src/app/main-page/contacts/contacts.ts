import { Component, computed, HostListener, inject, signal, viewChild } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { ContactService } from '../../shared/services/contact-service';
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
export class Contacts {
  contactService = inject(ContactService);
  authService = inject(AuthService);

  dialog = viewChild<ContactDialog>(ContactDialog);
  contactInfo = viewChild<ContactInfo>(ContactInfo);
  contactList = viewChild<ContactList>(ContactList);

  isMobile = signal<boolean>(window.innerWidth <= 768);
  isDetailOpen = signal<boolean>(false);
  addContactSuccess = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  contactToDelete = signal<Contact | null>(null);
  activeContactID = signal<string | null>(null);

  activeContact = computed<Contact | null>(() => {
    const id = this.activeContactID();
    if (!id) return null;

    return this.contactService.contacts().find((contact) => contact.id === id) ?? null;
  });

  canDeleteActiveContact = computed<boolean>(() => this.canDeleteContact(this.activeContact()));

  /**
   * Updates the responsive state on viewport resize.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

  /**
   * Sets the active contact and opens and focuses on the detail view.
   *
   * @param selection The selected contact and its identifier
   * @returns void
   */
  setActiveContact(selection: { id: string; contact: Contact }): void {
    this.activeContactID.set(selection.id);
    this.isDetailOpen.set(true);

    setTimeout(() => {
      this.contactInfo()?.focusDetails();
    }, 0);
  }

  /**
   * Closes the contact detail view and sets focus back on the contact in the list.
   *
   * @returns void
   */
  closeContactInfo(): void {
    this.isDetailOpen.set(false);

    setTimeout(() => {
      this.contactList()?.focusActiveContact(this.activeContactID());
    }, 0);
  }

  /**
   * Opens the dialog for creating a new contact.
   *
   * @returns void
   */
  openAddDialog(): void {
    this.dialog()?.openAddDialog();
  }

  /**
   * Opens the edit dialog for a specific contact.
   *
   * @param contact The contact to edit
   * @returns void
   */
  openEditDialog(contact: Contact): void {
    this.activeContactID.set(contact.id ?? null);
    this.dialog()?.openEditDialog(contact);
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
    if (this.dialog()?.dialogMode === 'add') {
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
      avatar: data.avatar,
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
    const newContactId = await this.contactService.addDocument(contact);
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
    if (!this.activeContact()) return;

    const contact: Contact = {
      id: this.activeContact()?.id,
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: this.activeContact()?.isAvailable ?? true,
      userColor: this.activeContact()?.userColor,
      avatar: data.avatar,
    };

    this.contactService.updateDocument(contact, 'contacts');
    this.showToast();
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

    this.contactToDelete.set(contact);
    this.showDeleteConfirm.set(true);
  }

  /**
   * Confirms deletion of the selected contact.
   *
   * Removes the contact and resets related UI state.
   *
   * @returns void
   */
  confirmDelete(): void {
    const contact = this.contactToDelete();
    if (!contact?.id) return;

    this.contactService.deleteDocument('contacts', contact.id);

    this.activeContactID.set(null);
    this.isDetailOpen.set(false);
    this.contactToDelete.set(null);
    this.showDeleteConfirm.set(false);
    this.dialog()?.closeDialog();
  }

  /**
   * Cancels the delete confirmation dialog.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.contactToDelete.set(null);
    this.showDeleteConfirm.set(false);
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

    const currentUserEmail = this.authService.firebaseAuth.currentUser?.email?.trim().toLowerCase();
    const contactEmail = contact.email.trim().toLowerCase();

    if (!currentUserEmail) return true;
    return currentUserEmail !== contactEmail;
  }

  /**
   * Displays a temporary toast notification.
   *
   * @returns void
   */
  showToast(): void {
    this.addContactSuccess.set(true);

    setTimeout(() => {
      this.addContactSuccess.set(false);
    }, 2000);
  }
}
