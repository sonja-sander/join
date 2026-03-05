import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { Contact } from '../../../shared/interfaces/contact';

@Component({
  selector: 'app-contact-list',
  imports: [SingleContact],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
/**
 * Renders the list of contacts and emits selection events.
 */
export class ContactList {
  @Input() contacts: Contact[] = [];
  @Input() activeContactID: string | null = null;
  @Input() loading = false;
  @Output() selected = new EventEmitter<{ contact: Contact; id: string }>();
  @Output() addContact = new EventEmitter<void>();

  /**
   * Returns the first letter of a contact name, or a fallback symbol.
   */
  getFirstLetter(contact: Contact): string {
    const name = contact?.name?.trim();
    if (!name) {
      return '#';
    }
    return name.charAt(0).toUpperCase();
  }

  /**
   * Checks if the current item starts a new letter group.
   */
  isNewLetter(index: number): boolean {
    if (index === 0) return true;
    const contacts = this.contacts;
    return this.getFirstLetter(contacts[index]) !== this.getFirstLetter(contacts[index - 1]);
  }

  /**
   * Builds a stable id for a contact entry.
   */
  getContactId(contact: Contact, index: number): string {
    return contact.id ?? `${contact.name}-${index}`;
  }

  /**
   * Emits the active contact selection with a computed id.
   */
  setActiveContact(contact: Contact, index: number): void {
    const id = this.getContactId(contact, index);
    this.selected.emit({ contact, id });
  }
}
