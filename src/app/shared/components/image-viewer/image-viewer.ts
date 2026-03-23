import { Component, HostListener, inject, input, OnInit, output } from '@angular/core';
import { Attachment } from '../../interfaces/task';
import { FileService } from '../../services/file-service';
import { A11yModule } from '@angular/cdk/a11y';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-image-viewer',
  imports: [A11yModule, Icon],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss',
})
/**
 * ImageViewer component
 *
 * Displays task attachments in a fullscreen viewer.
 * Supports image navigation, zoom controls, and keyboard interaction.
 */
export class ImageViewer implements OnInit {
  fileService = inject(FileService);

  attachments = input<Array<Attachment>>([]);
  startIndex = input<number>(0);
  
  viewerStateChange = output<boolean>();
  close = output<void>();

  currentIndex: number = 0;
  scale: number = 1;
  minScale: number = 0.25;
  maxScale: number = 3;
  zoomStep: number = 0.25;

  /**
   * Initializes the image viewer.
   *
   * Sets the starting image index and
   * emits the viewer open state.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.currentIndex = this.startIndex();
    this.viewerStateChange.emit(true);
  }

  /**
   * Closes the image viewer.
   *
   * Emits viewer state updates and
   * notifies the parent component.
   *
   * @returns void
   */
  closeImageViewer(): void {
    this.viewerStateChange.emit(false);
    this.close.emit();
  }

  /**
   * Handles clicks on the viewer backdrop.
   *
   * Closes the viewer when the overlay
   * background is clicked.
   *
   * @param event The mouse click event
   * @returns void
   */
  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('viewer-overlay')) {
      this.closeImageViewer();
    }
  }

  /**
   * Handles the Escape key interaction.
   *
   * Prevents default browser behavior and
   * closes the image viewer.
   *
   * @param event The keyboard event triggered by Escape
   * @returns void
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeImageViewer();
  }

  /**
   * Returns the currently displayed attachment.
   *
   * @returns The current attachment
   */
  get currentAttachment(): Attachment {
    return this.attachments()[this.currentIndex];
  }

  /**
   * Increases the zoom level of the image.
   *
   * @returns void
   */
  zoomIn(): void {
    this.scale = Math.min(this.scale + this.zoomStep, this.maxScale);
  }

  /**
   * Decreases the zoom level of the image.
   *
   * @returns void
   */
  zoomOut(): void {
    this.scale = Math.max(this.scale - this.zoomStep, this.minScale);
  }

  /**
   * Handles mouse wheel zoom interaction.
   *
   * Zooms in or out depending on the
   * scroll direction.
   *
   * @param event The mouse wheel event
   * @returns void
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  /**
   * Navigates to the previous image.
   *
   * Wraps to the last image when the
   * beginning of the list is reached.
   *
   * @returns void
   */
  previousImage(): void {
    if (this.attachments.length <= 1) return;

    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = this.attachments.length - 1;
    }

    this.resetZoom();
  }

  /**
   * Navigates to the next image.
   *
   * Wraps to the first image when the
   * end of the list is reached.
   *
   * @returns void
   */
  nextImage(): void {
    if (this.attachments.length <= 1) return;
    
    this.currentIndex++;

    if (this.currentIndex >= this.attachments.length) {
      this.currentIndex = 0;
    }

    this.resetZoom();
  }

  /**
   * Resets the zoom level to the default value.
   *
   * @returns void
   */
  resetZoom(): void {
    this.scale = 1;
  }
}