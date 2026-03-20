import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
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
  @Input() activeContact: Contact | null = null;
  @Input() canDelete: boolean = true;
  @Output() back = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();
  @Output() requestDelete = new EventEmitter<void>();

  readonly downLgBreakpoint = 768;
  isDownLg = this.isDownLgViewport();
  fabMenuOpen: boolean = false;
  profileAnimating: boolean = false;
  readonly getTwoInitials = getTwoInitials;

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
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  /**
   * Closes the floating action menu.
   */
  closeFabMenu(): void {
    this.fabMenuOpen = false;
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
    this.isDownLg = this.isDownLgViewport();
    if (!this.isDownLg) this.closeFabMenu();
  }

  /**
   * Triggers the profile animation when the active contact changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeContact'] || !this.activeContact) return;
    this.profileAnimating = false;
    setTimeout(() => {
      this.profileAnimating = true;
    }, 0);
  }

    /**
   * Determines whether the viewport width is
   * below the defined large-screen breakpoint.
   *
   * @returns True if the viewport is smaller than or equal to the breakpoint
   */
  private isDownLgViewport(): boolean {
    return window.innerWidth <= this.downLgBreakpoint;
  }
}
