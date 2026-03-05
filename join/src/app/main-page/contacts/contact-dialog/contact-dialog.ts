import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact } from '../../../shared/interfaces/contact';
import { ContactFormData } from '../../../shared/interfaces/contact-form-data';
import { getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
/**
 * ContactDialog component
 *
 * Provides a modal dialog for adding and editing contacts.
 * Manages dialog state, form validation, and user interactions
 * such as saving or deleting a contact.
 */
export class ContactDialog {
  @ViewChild('contactDialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('contactForm') contactForm!: NgForm;
  @Input() canDelete = true;
  dialogMode: 'add' | 'edit' = 'add';
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
  showDeleteConfirm: boolean = false;

  @Output() saveContact = new EventEmitter<ContactFormData>();
  // @Output() deleteContact = new EventEmitter<string>();
  @Output() requestDelete = new EventEmitter<void>();

  contactData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
  };

  // #region Methods
  // #region Opening dialog

  /**
   * Opens the dialog in add mode.
   *
   * Resets all form fields and prepares the dialog
   * for creating a new contact.
   *
   * @returns void
   */
  openAddDialog(): void {
    this.dialogMode = 'add';

    this.contactData = {
      name: '',
      email: '',
      phone: '',
    };

    this.openDialog();
  }

  /**
   * Opens the dialog in edit mode.
   *
   * Loads the provided contact data into the form
   * and prepares the dialog for editing.
   *
   * @param contact The contact whose data should be edited
   * @returns void
   */
  openEditDialog(contact: Contact): void {
    this.dialogMode = 'edit';

    this.contactData.name = contact.name;
    this.contactData.email = contact.email;
    this.contactData.phone = String(contact.phone);
    this.userColor = contact.userColor ?? null;

    this.openDialog();
  }

  /**
   * Displays the dialog as a modal window.
   *
   * Applies the active dialog state and visual styling.
   *
   * @returns void
   */
  openDialog(): void {
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
  }
  // #endregion

  /**
   * Handles form submission.
   *
   * Validates the form, emits the save event with
   * the entered contact data, and closes the dialog.
   * In add mode, the form is reset after submission.
   *
   * @param form The Angular form instance
   * @returns void
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.saveContact.emit({
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone,
    });

    this.closeDialog();

    if (this.dialogMode === 'add') {
      form.resetForm({
        name: '',
        email: '',
        phone: '',
      });
    }
  }

  /**
   * Handles the delete action.
   *
   * Emits the delete event and closes the dialog.
   *
   * @returns void
   */
  onDeleteClick(): void {
    this.requestDelete.emit();
  }

  // #region Closing dialog

  /**
   * Closes the dialog.
   *
   * Removes the active dialog state and closes
   * the native dialog element.
   *
   * @returns void
   */
  closeDialog(): void {
    const el = this.dialog.nativeElement;
    el.classList.remove('opened');
    el.close();

    queueMicrotask(() => {
      this.contactForm.resetForm({
        name: '',
        email: '',
        phone: '',
      });
    });
  }

  /**
   * Handles clicks on the dialog backdrop.
   *
   * Closes the dialog only when the backdrop itself
   * was clicked.
   *
   * @param event The mouse event triggered by the click
   * @returns void
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
  }

  /**
   * Handles the Escape key interaction.
   *
   * Prevents the default browser behavior
   * and closes the dialog manually.
   *
   * @param event The triggered escape event
   * @returns void
   */
  onEsc(event: Event): void {
    event.preventDefault();
    this.closeDialog();
  }
  // #endregion

  @HostListener('contextmenu', ['$event'])
  /**
   * Prevents the default context menu on the contacts page.
   */
  onContextMenu(event: Event): void {
    event.preventDefault();
  }
  // #endregion
}
