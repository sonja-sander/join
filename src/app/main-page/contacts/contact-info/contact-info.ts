import {
  Component,
  HostListener,
  OnChanges,
  SimpleChanges,
  input,
  output,
  signal,
} from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-contact-info',
  imports: [Avatar, Icon],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
/**
 * Shows details for the active contact and provides action shortcuts.
 */
export class ContactInfo implements OnChanges {
  activeContact = input.required<Contact>();
  canDelete = input<boolean>(true);

  back = output<void>();
  editContact = output<void>();
  requestDelete = output<void>();

  fabMenuOpen = signal(false);
  profileAnimating = signal(false);
  isDownLg = signal(window.innerWidth <= 768);

  readonly getTwoInitials = getTwoInitials;

  /**
   * Handles viewport resize events.
   *
   * Updates the responsive state and closes
   * the floating action menu when switching
   * to larger screen sizes.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.isDownLg.set(window.innerWidth <= 768);
    if (!this.isDownLg()) this.closeFabMenu();
  }

  /**
   * Triggers the profile animation when the active contact changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeContact'] || !this.activeContact()) return;
    this.profileAnimating.set(false);

    setTimeout(() => {
      this.profileAnimating.set(true);
    }, 0);
  }

  /**
   * Checks whether a contact has a valid phone number.
   *
   * @param phone The phone number to evaluate
   * @returns True if the phone number contains a non-empty value
   */
  hasPhoneNumber(phone: Contact['phone'] | null | undefined): boolean {
    return String(phone ?? '').trim().length > 0;
  }

  /**
   * Emits a back event and prevents the default link action.
   */
  handleBack(event: Event): void {
    event.preventDefault();
    this.back.emit();
  }

  /**
   * Toggles the floating action menu visibility.
   */
  toggleFabMenu(): void {
    this.fabMenuOpen.update((open) => !open);
  }

  /**
   * Closes the floating action menu.
   */
  closeFabMenu(): void {
    this.fabMenuOpen.set(false);
  }

  /**
   * Emits edit action and closes the action menu.
   */
  handleFabEdit(): void {
    this.editContact.emit();
    this.closeFabMenu();
  }

  /**
   * Opens a small confirmation toast before deleting.
   */
  handleFabDelete(): void {
    this.requestDelete.emit();
  }
}
