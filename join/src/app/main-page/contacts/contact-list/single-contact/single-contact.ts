import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../../shared/utilities/utils';

@Component({
  selector: 'app-single-contact',
  imports: [],
  templateUrl: './single-contact.html',
  styleUrl: './single-contact.scss',
})
/**
 * Displays a single contact row and emits selection when clicked.
 */
export class SingleContact {
  @Input() contact?: Contact;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<Contact>();

  readonly getTwoInitials = getTwoInitials;

  /**
   * Emits the current contact as the selected item.
   */
  setContactAsSelected() {
    this.selected.emit(this.contact);
  }
}
