import { Injectable } from '@angular/core';
import { Attachment } from '../interfaces/task';

@Injectable({
  providedIn: 'root',
})
/**
 * FileService
 *
 * Provides utilities for image processing, validation,
 * size calculations, and downloading attachments.
 */
export class FileService {
  /**
   * Compresses an image file.
   *
   * Converts the file to an image element, resizes it
   * within the specified dimensions, and exports it
   * as a compressed base64 string.
   *
   * @param file The image file or blob
   * @param maxWidth The maximum allowed width
   * @param maxHeight The maximum allowed height
   * @param quality The compression quality
   * @returns A compressed base64 image string
   */
  async compressImage(
    file: File | Blob,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
  ): Promise<string> {
    const img = await this.blobToImage(file);
    const { width, height } = this.calculateImageSize(img, maxWidth, maxHeight);
    return this.drawAndExportBase64(img, width, height, quality);
  }

  /**
   * Converts a file or blob into an HTML image element.
   *
   * @param file The file or blob to convert
   * @returns A promise resolving to an image element
   */
  blobToImage(file: File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target?.result) {
          reject('No file result');
          return;
        }

        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject('Error while loading image');
        img.src = event.target.result as string;
      };

      reader.onerror = () => reject('Error while reading file');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculates the scaled image size while preserving aspect ratio.
   *
   * @param img The source image element
   * @param maxWidth The maximum allowed width
   * @param maxHeight The maximum allowed height
   * @returns The calculated width and height
   */
  calculateImageSize(
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      } else {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    }

    return { width, height };
  }

  /**
   * Draws the image onto a canvas and exports it as a base64 string.
   *
   * @param img The source image
   * @param width The canvas width
   * @param height The canvas height
   * @param quality The JPEG compression quality
   * @returns A base64 encoded image string
   */
  drawAndExportBase64(
    img: HTMLImageElement,
    width: number,
    height: number,
    quality: number,
  ): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No canvas context');
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', quality);
  }

  /**
   * Calculates the size of a base64 string in bytes.
   *
   * @param base64 The base64 encoded string
   * @returns The estimated size in bytes
   */
  base64SizeInBytes(base64: string): number {
    const b64 = base64.split(',')[1] ?? base64;
    return Math.floor((b64.length * 3) / 4);
  }

  /**
   * Validates the file type of an uploaded image.
   *
   * @param file The file to validate
   * @returns True if the file type is supported
   */
  isValidFileType(file: File): boolean {
    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      return true;
    }
    return false;
  }

  /**
   * Checks whether a file size is within the allowed limit.
   *
   * @param sizeInBytes The file size in bytes
   * @returns True if the file size is below the limit
   */
  isWithinSizeLimit(sizeInBytes: number): boolean {
    if (sizeInBytes < 1_000_000) {
      return true;
    }
    return false;
  }

  /**
   * Downloads an attachment from its base64 representation.
   *
   * Converts the base64 data into a blob and triggers
   * a browser download.
   *
   * @param attachment The attachment to download
   * @returns Promise<void>
   */
  async downloadAttachment(attachment: Attachment): Promise<void> {
    try {
      const base64DataUrl = attachment.base64;
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = attachment.fileName || 'attachment';
      downloadLink.click();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error while downloading attachment:', error);
    }
  }
}
