import { Component, HostListener, inject, ElementRef, input, output, signal } from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { ContactService } from '../../../shared/services/contact-service';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Icon } from '../../../shared/components/icon/icon';

/**
 * Searchable multi-select dropdown for choosing task assignees.
 */
@Component({
  selector: 'app-dropdown-assignee',
  imports: [Avatar, Icon],
  templateUrl: './dropdown-assignee.html',
  styleUrl: './dropdown-assignee.scss',
})
export class DropdownAssignee {
  elementRef = inject(ElementRef);
  contactService = inject(ContactService);

  selectedContacts = input<Array<Contact>>([]);

  selectedContactsChange = output<Array<Contact>>();

  isDropdownOpen = signal(false);
  assigneeQuery = signal('');

  getTwoInitials = getTwoInitials;

  /** Contacts filtered by the current search query. */
  get filteredContacts(): Contact[] {
    const query = this.assigneeQuery().trim().toLowerCase();
    if (!query) return this.contactService.contacts();
    return this.contactService
      .contacts()
      .filter((contact) => contact.name.toLowerCase().includes(query));
  }

  /**
   * Toggles dropdown visibility and resets search if it closes.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    if (event && this.isDropdownOpen() && event.target instanceof HTMLInputElement) return;
    this.isDropdownOpen.update((open) => !open);
    if (!this.isDropdownOpen()) this.assigneeQuery.set('');
  }

  /**
   * Closes the dropdown when the pointer interaction happens outside this component.
   * @param event Pointer-down event from the document.
   */
  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsidePointerDown(event: Event): void {
    if (!this.isDropdownOpen()) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen.set(false);
    this.assigneeQuery.set('');
  }

  /**
   * Adds or removes a contact from the current selection.
   * @param contact Contact to toggle.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleContact(contact: Contact, event?: Event): void {
    event?.stopPropagation();

    const current = this.selectedContacts();
    const exists = current.some((item) => item.id === contact.id);

    if (!exists) {
      this.selectedContactsChange.emit([...current, contact]);
      return;
    }

    this.selectedContactsChange.emit(current.filter((item) => item.id !== contact.id));
  }

  /**
   * Returns whether a contact is currently selected.
   * @param contact Contact to check.
   * @returns `true` if the contact is selected.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedContacts().some((item) => item.id === contact.id);
  }

  /**
   * Provides a stable identity for contact list rendering.
   * @param contact Contact item from the rendered list.
   * @param index Fallback index when no ID is available.
   * @returns Stable key value for track-by usage.
   */
  getContactId(contact: Contact, index: number): string {
    return contact.id ?? `${contact.name}-${index}`;
  }
}
