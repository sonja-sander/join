import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { Attachment } from '../../../shared/interfaces/task';
import { FileService } from '../../../shared/services/file-service';
import { ImageViewer } from '../../../shared/components/image-viewer/image-viewer';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-attachments',
  imports: [ImageViewer, Icon],
  templateUrl: './attachments.html',
  styleUrl: './attachments.scss',
})
/**
 * Attachments component
 *
 * Handles file uploads, drag-and-drop interactions,
 * image compression, and attachment management
 * for tasks.
 */
export class Attachments {
  fileService = inject(FileService);
  
  attachments = input<Array<Attachment>>([]);
  
  deleteAll = output<void>();
  attachmentsChange = output<Array<Attachment>>();
  viewerStateChange = output<boolean>();
  imageTypeError = output<void>();
  taskSizeError = output<void>();

  filePicker = viewChild<ElementRef<HTMLInputElement>>('filePicker');
  gallery = viewChild<ElementRef<HTMLDivElement>>('gallery');

  isDragging: boolean = false;
  showViewer: boolean = false;
  viewerStartIndex: number = 0;

  /**
   * Handles drag-over events for the drop zone.
   *
   * @param event The drag event
   * @returns void
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  /**
   * Handles drag-leave events for the drop zone.
   *
   * @param event The drag event
   * @returns void
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  /**
   * Opens the file picker dialog.
   *
   * @returns void
   */
  openFilePicker(): void {
    this.filePicker()?.nativeElement.click();
  }

  /**
   * Handles files dropped into the drop zone.
   *
   * @param event The drag event containing files
   * @returns void
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (!event.dataTransfer?.files) return;

    this.handleFiles(event.dataTransfer.files);
  }

  /**
   * Handles file selection via the file input.
   *
   * @param event The file input event
   * @returns void
   */
  onFileSelect(event: Event): void {
    const filePicker = event.target as HTMLInputElement;
    if (!filePicker.files) return;

    this.handleFiles(filePicker.files);
    filePicker.value = '';
  }

  /**
   * Processes selected files.
   *
   * Compresses images, validates file types,
   * and emits the updated attachments array.
   *
   * @param files The selected files
   * @returns Promise<void>
   */
  async handleFiles(files: FileList): Promise<void> {
    const allImages = Array.from(this.attachments());

    for (const file of Array.from(files)) {
      if (this.hasInvalidFileType(file)) return;

      const compressedBase64 = await this.fileService.compressImage(file, 800, 800, 0.7);
      const sizeInBytes = this.fileService.base64SizeInBytes(compressedBase64);

      this.addToAttachmentArray(allImages, file, sizeInBytes, compressedBase64);
    }

    const totalSize = this.getTotalAttachmentsSize(allImages);
    if (this.exceedsTaskSizeLimit(totalSize)) return;

    this.attachmentsChange.emit(allImages);
    this.scrollToRight();
  }

  /**
   * Checks if a file has an invalid type.
   *
   * Emits an error event if the type is not allowed.
   *
   * @param file The file to validate
   * @returns True if the file type is invalid
   */
  hasInvalidFileType(file: File): boolean {
    const isInvalid = !this.fileService.isValidFileType(file);
    if (isInvalid) {
      this.imageTypeError.emit();
      const filePickerEl = this.filePicker()?.nativeElement;
      if (filePickerEl) {
        filePickerEl.value = '';
      } 
    }
    return isInvalid;
  }

  /**
   * Calculates the total size of all attachments.
   *
   * @param attachments The attachment array
   * @returns The total size in bytes
   */
  getTotalAttachmentsSize(attachments: Array<Attachment>): number {
    return attachments.reduce(
      (total, attachment) => total + attachment.base64Size,
      0
    );
  }

  /**
   * Checks whether the total attachment size exceeds the limit.
   *
   * Emits an error event when the size is too large.
   *
   * @param totalSize The total attachment size
   * @returns True if the limit is exceeded
   */
  exceedsTaskSizeLimit(totalSize: number): boolean {
    const exceeds = !this.fileService.isWithinSizeLimit(totalSize);
    if (exceeds) {
      this.taskSizeError.emit();
      const filePickerEl = this.filePicker()?.nativeElement;
      if (filePickerEl) {
        filePickerEl.value = '';
      } 
    }
    return exceeds;
  }

  /**
   * Adds a file to the attachment array.
   *
   * @param arr The attachment array
   * @param file The file to add
   * @param size The file size in bytes
   * @param base64 The base64 encoded file
   * @returns void
   */
  addToAttachmentArray(arr: Array<Attachment>, file: File, size: number, base64: string): void {
    arr.push({
      fileName: file.name,
      fileType: file.type,
      base64Size: size,
      base64: base64
    });
  }

  /**
   * Scrolls the attachment gallery to the right.
   *
   * @returns void
   */
  scrollToRight(): void {
    setTimeout(() => {
      const galleryEl = this.gallery()?.nativeElement;
      if(!galleryEl) return;
      galleryEl.scrollLeft = galleryEl.scrollWidth;
    });
  }

  /**
   * Emits an event to delete all attachments.
   *
   * @returns void
   */
  deleteAllAttachments(): void {
    this.deleteAll.emit();
    const filePickerEl = this.filePicker()?.nativeElement;
    if (filePickerEl) {
      filePickerEl.value = '';
    } 
  }

  /**
   * Deletes a single attachment.
   *
   * @param event The mouse event triggering the deletion
   * @param attachmentToDelete The attachment to remove
   * @returns void
   */
  deleteSingleAttachment(event: MouseEvent, attachmentToDelete: Attachment): void {
    event.stopPropagation();

    const updatedAttachments = this.attachments().filter(
      attachment => attachment !== attachmentToDelete
    );

    this.attachmentsChange.emit(updatedAttachments);
  }

  /**
   * Opens the image viewer starting at the selected index.
   *
   * @param index The index of the image to display
   * @returns void
   */
  openImageViewer(index: number): void {
    this.viewerStartIndex = index;
    this.showViewer = true;
  }

  /**
   * Closes the image viewer.
   *
   * @returns void
   */
  closeImageViewer(): void {
    this.showViewer = false;
  }
}