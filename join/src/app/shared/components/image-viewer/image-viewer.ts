import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Attachment } from '../../interfaces/task';
import { FileService } from '../../services/file-service';

@Component({
  selector: 'app-image-viewer',
  imports: [],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss',
})
export class ImageViewer implements OnInit {
  fileService = inject(FileService);
  @Input() attachments: Array<Attachment> = [];
  @Input() startIndex = 0;
  @Output() close = new EventEmitter<void>();
  currentIndex = 0;
  scale = 1;
  minScale = 0.25;
  maxScale = 3;
  zoomStep = 0.25;

  ngOnInit(): void {
    this.currentIndex = this.startIndex;
  }

  closeViewer() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('viewer-overlay')) {
      this.closeViewer();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: Event): void {
    event.preventDefault();
    this.closeViewer();
  }

  get currentAttachment(): Attachment {
    return this.attachments[this.currentIndex];
  }

  zoomIn(): void {
    this.scale = Math.min(this.scale + this.zoomStep, this.maxScale);
  }

  zoomOut(): void {
    this.scale = Math.max(this.scale - this.zoomStep, this.minScale);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  previousImage(): void {
    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = this.attachments.length - 1;
    }

    this.resetZoom();
  }

  nextImage(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.attachments.length) {
      this.currentIndex = 0;
    }

    this.resetZoom();
  }

  resetZoom(): void {
    this.scale = 1;
  }
}
