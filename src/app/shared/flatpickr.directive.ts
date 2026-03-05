import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import type { Options } from 'flatpickr/dist/types/options';

@Directive({
  selector: 'input[appFlatpickr]',
  standalone: true,
})
export class FlatpickrDirective implements OnInit, OnDestroy {
  @Input() fpOptions: Partial<Options> = {};
  private instance?: FlatpickrInstance;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.instance = flatpickr(this.el.nativeElement, {
      dateFormat: 'Y/m/d',
      allowInput: false,
      disableMobile: true,
      ...this.fpOptions,
    });
  }

  ngOnDestroy(): void {
    this.instance?.destroy();
  }
}
