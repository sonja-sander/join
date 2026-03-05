import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LogInFormData, SignUpFormData } from '../shared/interfaces/login-form-data';
import { AuthService } from '../shared/services/auth-service';
import { AsyncPipe } from '@angular/common';
import { getGreeting } from '../shared/utilities/utils';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule, AsyncPipe],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
/**
 * MainPage component
 *
 * Represents the application's entry page.
 * Handles user authentication flows including login,
 * guest login, and sign-up, as well as responsive behavior
 * and introductory animations.
 */
export class MainPage implements OnInit {
  firebaseService = inject(FirebaseService);
  authService = inject(AuthService);
  router = inject(Router);
  user$ = this.authService.user$;

  isMobile: boolean = false;
  showSignUp: boolean = false;
  isLoggingIn: boolean = false;
  loginError: boolean = false;
  isSigningUp: boolean = false;
  signUpError: boolean = false;
  toastVisible: boolean = false;
  showMobileGreeting: boolean = false;

  introActive: boolean = true;
  logoMoving: boolean = false;

  confirmPassword = '';
  showLogInPassword: boolean = false;
  showSignUpPassword: boolean = false;
  showConfirmPassword: boolean = false;

  logInData: LogInFormData = {
    email: '',
    password: '',
  };

  signUpData: SignUpFormData = {
    name: '',
    email: '',
    password: '',
  };

  /**
   * Initializes the component.
   *
   * Sets up responsive checks , evaluates navigation state,
   * and controls whether the intro animation is displayed.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.checkScreen();
    const state = history.state;

    if (state?.openSignUp) {
      this.showSignUp = true;
    }

    if (!state?.skipIntro) {
      this.showIntro();
    } else {
      this.introActive = false;
      this.logoMoving = true;
    }

    window.addEventListener('resize', () => this.checkScreen());
  }

  /**
   * Checks the current screen size.
   *
   * Updates the mobile state based
   * on the viewport width.
   *
   * @returns void
   */
  checkScreen(): void {
    this.isMobile = window.innerWidth < 1025;
  }

  /**
   * Plays the intro animation sequence.
   *
   * @returns void
   */
  showIntro(): void {
    setTimeout(() => {
      this.logoMoving = true;
    }, 300);

    setTimeout(() => {
      this.introActive = false;
    }, 1400);
  }

  /**
   * Opens the sign-up form.
   *
   * @returns void
   */
  openSignUp(): void {
    this.showSignUp = true;
  }

  /**
   * Closes the sign-up form.
   *
   * @returns void
   */
  closeSignUp(): void {
    this.showSignUp = false;
  }

  /**
   * Toggles visibility of the login password field.
   *
   * @returns void
   */
  toggleLogInPassword(): void {
    this.showLogInPassword = !this.showLogInPassword;
  }

  /**
   * Toggles visibility of the sign-up password field.
   *
   * @returns void
   */
  toggleSignUpPassword(): void {
    this.showSignUpPassword = !this.showSignUpPassword;
  }

  /**
   * Toggles visibility of the confirm-password field.
   *
   * @returns void
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles user login.
   *
   * Validates the form, triggers authentication,
   * and navigates after successful login.
   *
   * @param form The login form instance
   * @returns void
   */
  onLogin(form: NgForm): void {
    if (this.isLoggingIn) return;

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    this.loginError = false;

    this.authService.logIn(this.logInData.email, this.logInData.password)
      .subscribe({
        next: () => {
          this.isLoggingIn = false;
          this.handleLoginNavigation();
        },
        error: (err) => {
          console.error('Login failed', err);
          this.isLoggingIn = false;
          this.loginError = true;
        },
      });
  }

  /**
   * Logs in the user as a guest.
   *
   * @returns void
   */
  guestLogin(): void {
    this.authService.guestLogIn().subscribe({
      next: () => {
        this.handleLoginNavigation();
      },
      error: (err) => {
        console.error('Guest login failed', err);
      },
    });
  }

  /**
   * Handles navigation after successful login.
   *
   * Displays a greeting on mobile devices
   * before redirecting to the summary page.
   *
   * @returns void
   */
  handleLoginNavigation(): void {
    if (this.isMobile) {
      this.showMobileGreeting = true;

      setTimeout(() => {
        this.showMobileGreeting = false;
        this.router.navigateByUrl('/summary', { replaceUrl: true });
      }, 2000);
    } else {
      this.router.navigateByUrl('/summary', { replaceUrl: true });
    }
  }

  /**
   * Handles user sign-up.
   *
   * Validates the sign-up form, creates a new user account,
   * and triggers the corresponding success or error flow.
   *
   * @param form The sign-up form instance
   * @returns void
   */
  onSignUp(form: NgForm): void {
    if (this.isSigningUp) return;
    if (this.isSignUpFormInvalid(form)) return;

    this.isSigningUp = true;
    this.signUpError = false;

    this.authService.signUp(this.signUpData.name, this.signUpData.email, this.signUpData.password
    ).subscribe({
      next: () => {
        this.onSignUpSuccess();
      },
      error: (err) => {
        this.onSignUpError(err);
      },
    });
  }

  /**
   * Validates the sign-up form state.
   *
   * Marks all form fields as touched when validation fails.
   *
   * @param form The sign-up form instance
   * @returns True if the form is invalid
   */
  isSignUpFormInvalid(form: NgForm): boolean {
    if (form.invalid || this.signUpData.password !== this.confirmPassword) {
      form.control.markAllAsTouched();
      return true;
    }
    return false;
  }

  /**
   * Handles a successful sign-up.
   *
   * Resets form state, closes the sign-up view,
   * and displays a success notification.
   *
   * @returns void
   */
  onSignUpSuccess(): void {
    this.isSigningUp = false;
    this.confirmPassword = '';
    this.signUpData = {
      name: '',
      email: '',
      password: '',
    };
    this.showSignUp = false;
    this.showToast();
  }

  /**
   * Handles a sign-up error.
   *
   * Logs the error and updates the UI
   * to reflect the failed sign-up attempt.
   *
   * @param err The error returned during sign-up
   * @returns void
   */
  onSignUpError(err: unknown): void {
    console.error('Sign up failed', err);
    this.isSigningUp = false;
    this.signUpError = true;
  }

  /**
   * Displays a temporary success toast.
   *
   * @returns void
   */
  showToast(): void {
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 2500);
  }

  /**
   * Returns a contextual greeting message.
   *
   * @returns The greeting string
   */
  get greeting(): string {
    return getGreeting();
  }

  getGreetingName(userEmail: string | null | undefined): string {
    const email = userEmail?.trim().toLowerCase();
    const contact = this.authService.contactService.contacts.find(
      (item) => item.email?.trim().toLowerCase() === email,
    );
    return contact?.name ?? '';
  }
}
