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

  onDeleteClick(): void {
    this.deleteAll.emit();
  }

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
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
          console.error(`Only PNG and JPEG are allowed.`);
          return;
      }

      const compressedBase64 = await this.fileService.compressImage(file, 800, 800, 0.7);

      allImages.push({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64: compressedBase64
      });
    }

    this.attachmentsChange.emit(allImages);
  }
}
