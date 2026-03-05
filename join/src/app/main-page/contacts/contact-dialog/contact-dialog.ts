import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact } from '../../../shared/interfaces/contact';
import { ContactFormData } from '../../../shared/interfaces/contact-form-data';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { FileService } from '../../../shared/services/file-service';
import { Toast } from '../../../shared/components/toast/toast';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule, Toast, A11yModule],
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
  isOpen: boolean = false;
  @ViewChild('contactForm') contactForm!: NgForm;
  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;
  @Input() canDelete = true;
  @Input() confirmOpen: boolean = false;
  dialogMode: 'add' | 'edit' = 'add';
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
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
    this.isOpen = true;
  }
  // #endregion

  openFilePicker(): void {
    this.filePicker.nativeElement.click();
  }

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
    this.isOpen = false;

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
    this.closeDialog();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: Event): void {
    if (!this.isOpen) return;
    if (this.confirmOpen) return;

    event.preventDefault();
    this.closeDialog();
  }

  confirmDelete(): void {
    this.requestDelete.emit();
  }

  // #endregion
  
  async onAvatarSelected(event: Event): Promise<void> {
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
    this.showTypeErrorToast();
    return isInvalid;
  }

  exceedsSizeLimit(size: number): boolean {
    const exceeds = !this.fileService.isWithinSizeLimit(size);
    this.showSizeErrorToast();
    return exceeds;
  }

  showTypeErrorToast(): void {
    this.imageTypeError = true;

    setTimeout(() => {
      this.imageTypeError = false;
    }, 2500);
  }

  showSizeErrorToast(): void {
    this.imageSizeError = true;

    setTimeout(() => {
      this.imageSizeError = false;
    }, 2500);
  }

  createAvatarObject(file: File, size: number, base64: string) {
    return {
      fileName: file.name,
      fileType: file.type,
      base64Size: size,
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
