import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Attachment } from '../../../shared/interfaces/task';
import { FileService } from '../../../shared/services/file-service';

@Component({
  selector: 'app-attachments',
  imports: [],
  templateUrl: './attachments.html',
  styleUrl: './attachments.scss',
})
export class Attachments {
  fileService = inject(FileService);
  @Input({ required: true }) attachments!: Attachment[];
  @Output() deleteAll = new EventEmitter<void>();
  @Output() attachmentsChange = new EventEmitter<Array<Attachment>>();
  isDragging = false;
  imageTypeError: boolean = false;
  taskSizeError: boolean = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (!event.dataTransfer?.files) return;
    
    this.handleFiles(event.dataTransfer.files);
  }

  onFileSelect(event: Event): void {
    const filePicker = event.target as HTMLInputElement;
    if (!filePicker.files) return;

    this.handleFiles(filePicker.files);
    filePicker.value = '';
  }

  async handleFiles(files: FileList): Promise<void> {
    this.imageTypeError = false;
    this.taskSizeError = false;

    const allImages = Array.from(this.attachments);

    for (const file of Array.from(files)) {
      if (this.hasInvalidFileType(file)) return;

      const compressedBase64 = await this.fileService.compressImage(file, 800, 800, 0.7);
      const sizeInBytes = this.fileService.base64SizeInBytes(compressedBase64);
      // if (this.exceedsSizeLimit(sizeInBytes)) return;

      this.addToAttachmentArray(allImages, file, sizeInBytes, compressedBase64);
    }

    const totalSize = this.getTotalAttachmentsSize(allImages);
    if (this.exceedsTaskSizeLimit(totalSize)) return;
    this.attachmentsChange.emit(allImages);
  }

  hasInvalidFileType(file: File): boolean {
    const isInvalid = !this.fileService.isValidFileType(file);
    this.imageTypeError = isInvalid;
    return isInvalid;
  }

  getTotalAttachmentsSize(attachments: Attachment[]): number {
    return attachments.reduce(
      (total, attachment) => total + attachment.base64Size,
      0
    );
  }

  exceedsTaskSizeLimit(totalSize: number): boolean {
    const exceeds = !this.fileService.isWithinSizeLimit(totalSize);
    this.taskSizeError = exceeds;
    return exceeds;
  }

  addToAttachmentArray(arr: Array<Attachment>, file: File, size: number, base64: string) {
    arr.push({
      fileName: file.name,
      fileType: file.type,
      base64Size: size,
      base64: base64
    });
  }

  deleteAllAttachments(): void {
    this.deleteAll.emit();
  }

  deleteSingleAttachment(attachmentToDelete: Attachment): void {
    const updatedAttachments = this.attachments.filter(
      attachment => attachment !== attachmentToDelete
    );

    this.attachmentsChange.emit(updatedAttachments);
  }
}
