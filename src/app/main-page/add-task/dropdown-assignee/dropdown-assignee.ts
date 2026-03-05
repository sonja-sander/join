import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  ElementRef,
} from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { FirebaseService } from '../../../shared/services/firebase-service';
import { getTwoInitials } from '../../../shared/utilities/utils';

/**
 * Searchable multi-select dropdown for choosing task assignees.
 */
@Component({
  selector: 'app-dropdown-assignee',
  imports: [],
  templateUrl: './dropdown-assignee.html',
  styleUrl: './dropdown-assignee.scss',
})
export class DropdownAssignee {
  elementRef = inject(ElementRef);
  firebaseService = inject(FirebaseService);

  getTwoInitials = getTwoInitials;

  /** Currently selected contacts. */
  @Input() selectedContacts: Contact[] = [];
  /** Emits whenever the contact selection changes. */
  @Output() selectedContactsChange = new EventEmitter<Contact[]>();

  isDropdownOpen = false;
  assigneeQuery = '';

  /** Contacts filtered by the current search query. */
  get filteredContacts(): Contact[] {
    const query = this.assigneeQuery.trim().toLowerCase();
    if (!query) return this.firebaseService.contacts;
    return this.firebaseService.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query),
    );
  }

  /**
   * Toggles dropdown visibility and resets search if it closes.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    if (event && this.isDropdownOpen && event.target instanceof HTMLInputElement) return;
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) this.assigneeQuery = '';
  }

  /**
   * Closes the dropdown when the pointer interaction happens outside this component.
   * @param event Pointer-down event from the document.
   */
  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsidePointerDown(event: Event): void {
    if (!this.isDropdownOpen) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen = false;
    this.assigneeQuery = '';
  }

  /**
   * Adds or removes a contact from the current selection.
   * @param contact Contact to toggle.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleContact(contact: Contact, event?: Event): void {
    event?.stopPropagation();
    const index = this.selectedContacts.findIndex((item) => item.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
      this.selectedContactsChange.emit(this.selectedContacts);
      return;
    }
    this.selectedContacts = this.selectedContacts.filter((item) => item.id !== contact.id);
    this.selectedContactsChange.emit(this.selectedContacts);
  }

  /**
   * Returns whether a contact is currently selected.
   * @param contact Contact to check.
   * @returns `true` if the contact is selected.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedContacts.some((item) => item.id === contact.id);
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
