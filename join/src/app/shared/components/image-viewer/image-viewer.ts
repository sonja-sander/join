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
  @Input() startIndex: number = 0;
  @Output() viewerStateChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  currentIndex: number = 0;
  scale: number = 1;
  minScale: number = 0.25;
  maxScale: number = 3;
  zoomStep: number = 0.25;

  ngOnInit(): void {
    this.currentIndex = this.startIndex;
    this.viewerStateChange.emit(true);
  }

  closeImageViewer() {
    this.viewerStateChange.emit(false);
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('viewer-overlay')) {
      this.closeImageViewer();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeImageViewer();
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
