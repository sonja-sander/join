import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  @Input() message: string = '';
  @Input() type: 'info' | 'error' = 'info';
  @Input() visible: boolean = false;
}