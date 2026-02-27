import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact } from '../../../shared/interfaces/contact';
import { ContactFormData } from '../../../shared/interfaces/contact-form-data';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { FileService } from '../../../shared/services/file-service';

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
  fileService = inject(FileService);
  @ViewChild('contactDialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('contactForm') contactForm!: NgForm;
  @Input() canDelete = true;
  dialogMode: 'add' | 'edit' = 'add';
  // avatarImg: string | null = null;
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
  showDeleteConfirm: boolean = false;
  imageTypeError: boolean = false;
  imageSizeError: boolean = false;

  @Output() saveContact = new EventEmitter<ContactFormData>();
  @Output() requestDelete = new EventEmitter<void>();

  contactData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    avatar: null
  };

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
      avatar: null
    };

    this.userColor = null;
    // this.avatarImg = null;

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

    this.contactData = {
      name: contact.name,
      email: contact.email,
      phone: String(contact.phone),
      avatar: contact.avatar
    };

    this.userColor = contact.userColor ?? null;
    // this.avatarImg = contact.avatar?.base64 ?? null;
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
      avatar: this.contactData.avatar
    });

    this.closeDialog();

    if (this.dialogMode === 'add') {
      form.resetForm({
        name: '',
        email: '',
        phone: '',
        avatar: null,
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
        avatar: null
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
    if ((event as KeyboardEvent).key === 'Escape') {
      event.preventDefault();
      this.closeDialog();
    } else {
      event.preventDefault();
    }
  }
  // #endregion
  
  async onAvatarSelected(event: Event): Promise<void> {
    this.imageTypeError = false;
    this.imageSizeError = false;

    const file = this.extractFile(event);
    if (!file) return;
    if (this.hasInvalidFileType(file)) return;

    const compressedBase64 = await this.fileService.compressImage(file, 250, 250, 0.7);
    const sizeInBytes = this.fileService.base64SizeInBytes(compressedBase64);
    if (this.exceedsSizeLimit(sizeInBytes)) return;
    
    this.contactData.avatar = this.createAvatarObject(file, sizeInBytes, compressedBase64);
  }

  extractFile(event: Event): File | null {
    const inputElement = event.target as HTMLInputElement;
    return inputElement.files?.[0] ?? null;
  }

  hasInvalidFileType(file: File): boolean {
    const isInvalid = !this.fileService.isValidFileType(file);
    this.imageTypeError = isInvalid;
    return isInvalid;
  }

  exceedsSizeLimit(size: number): boolean {
    const exceeds = !this.fileService.isWithinSizeLimit(size);
    this.imageSizeError = exceeds;
    return exceeds;
  }

  createAvatarObject(file: File, sizeInBytes: number, base64: string) {
    return {
      fileName: file.name,
      fileType: file.type,
      base64Size: sizeInBytes,
      base64: base64
    };
  }

  onAvatarDelete() {
    this.contactData.avatar = {
      fileName: '',
      fileType: '',
      base64Size: 0,
      base64: '' 
    };
  }
}
