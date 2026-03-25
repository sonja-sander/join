import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  name = input.required<string>();
  color = input<string>();
  avatar = input<string | null>(null);
  size = input<number>(40);

  initials = computed(() => {
    if (!this.name()) return '';

    return this.name()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  });
}
