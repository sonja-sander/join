import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { Contact } from '../../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../../shared/utilities/utils';
import { Avatar } from '../../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-single-contact',
  imports: [Avatar],
  templateUrl: './single-contact.html',
  styleUrl: './single-contact.scss',
})
/**
 * Displays a single contact row and emits selection when clicked.
 */
export class SingleContact {
  contact = input.required<Contact>();
  isActive = input<boolean>(false);

  selected = output<Contact>();

  buttonRef = viewChild<ElementRef>('contactButton');

  readonly getTwoInitials = getTwoInitials;

  /**
   * Emits the current contact as selected and removes focus from the trigger.
   *
   * Prevents the button from keeping focus so it does not override
   * the focus shift to the contact info view.
   */
  setContactAsSelected(event: Event): void {
    (event.currentTarget as HTMLElement).blur();

    this.selected.emit(this.contact());
  }
}
