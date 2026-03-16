import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  @Input() name!: string;
  @Input() color?: string;
  @Input() avatar?: string | null;
  @Input() size: number = 40;

  get initials(): string {
    if (!this.name) return '';

    return this.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
}
