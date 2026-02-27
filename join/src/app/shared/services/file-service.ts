import { Injectable } from '@angular/core';
import { Attachment } from '../interfaces/task';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  
  async compressImage(file: File | Blob, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
    const img = await this.blobToImage(file);
    const { width, height } = this.calculateImageSize(img, maxWidth, maxHeight);
    return this.drawAndExportBase64(img, width, height, quality);
  }

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

  calculateImageSize(img: HTMLImageElement, maxWidth: number, maxHeight: number): { width: number; height: number } {
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

  drawAndExportBase64(img: HTMLImageElement, width: number, height: number, quality: number): string {
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

  base64SizeInBytes(base64: string): number {
    const b64 = base64.split(',')[1] ?? base64;
    return Math.floor((b64.length * 3) / 4);
  }

  isValidFileType(file: File): boolean {
    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      return true;
    } 
    return false;
  }

  isWithinSizeLimit(sizeInBytes: number): boolean {
    if (sizeInBytes < 1_000_000) {
      return true;
    }
    return false;
  }

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
