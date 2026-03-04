import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { Attachment, Task } from '../../../shared/interfaces/task';
import { FileService } from '../../../shared/services/file-service';
import { ImageViewer } from '../../../shared/components/image-viewer/image-viewer';

@Component({
  selector: 'app-attachments',
  imports: [ImageViewer],
  templateUrl: './attachments.html',
  styleUrl: './attachments.scss',
})
export class Attachments {
  @ViewChild('gallery') gallery!: ElementRef<HTMLDivElement>;
  fileService = inject(FileService);
  @Input() attachments!: Attachment[];
  @Output() deleteAll = new EventEmitter<void>();
  @Output() attachmentsChange = new EventEmitter<Array<Attachment>>();
  @Output() viewerStateChange = new EventEmitter<boolean>();
  isDragging = false;
  @Output() imageTypeError = new EventEmitter<void>();
  @Output() taskSizeError = new EventEmitter<void>(); 
  showViewer = false;
  viewerStartIndex = 0;

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
    const allImages = Array.from(this.attachments);

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

  hasInvalidFileType(file: File): boolean {
    const isInvalid = !this.fileService.isValidFileType(file);
    if (isInvalid) {
      this.imageTypeError.emit();
    }
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
    if (exceeds) {
      this.taskSizeError.emit();
    }
    return exceeds;
  }

  addToAttachmentArray(arr: Array<Attachment>, file: File, size: number, base64: string): void {
    arr.push({
      fileName: file.name,
      fileType: file.type,
      base64Size: size,
      base64: base64
    });
  }

  scrollToRight(): void {
    setTimeout(() => {
      this.gallery.nativeElement.scrollLeft =
        this.gallery.nativeElement.scrollWidth;
    });
  }

  deleteAllAttachments(): void {
    this.deleteAll.emit();
  }

  deleteSingleAttachment(event: MouseEvent, attachmentToDelete: Attachment): void {
    event.stopPropagation();
    
    const updatedAttachments = this.attachments.filter(
      attachment => attachment !== attachmentToDelete
    );

    this.attachmentsChange.emit(updatedAttachments);
  }

  openImageViewer(index: number): void {
    this.viewerStartIndex = index;
    this.showViewer = true;
  }

  closeImageViewer() {
    this.showViewer = false;
  }
}
