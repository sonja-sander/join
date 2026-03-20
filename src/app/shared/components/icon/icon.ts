import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  @Input() name!: string;
  @Input() size?: number = 24;
}
