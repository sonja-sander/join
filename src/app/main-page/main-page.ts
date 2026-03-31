import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ContactService } from '../shared/services/contact-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LogInFormData, SignUpFormData } from '../shared/interfaces/login-form-data';
import { AuthService } from '../shared/services/auth-service';
import { AsyncPipe } from '@angular/common';
import { getGreeting } from '../shared/utilities/utils';
import { Toast } from '../shared/components/toast/toast';
import { Icon } from '../shared/components/icon/icon';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule, AsyncPipe, Toast, Icon],
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
  contactService = inject(ContactService);
  authService = inject(AuthService);
  router = inject(Router);

  loginTitle = viewChild<ElementRef>('loginTitle');

  isMobile = signal<boolean>(window.innerWidth < 1025);
  showMobileGreeting = signal<boolean>(false);
  introActive = signal<boolean>(true);
  logoMoving = signal<boolean>(false);
  
  showSignUp = signal<boolean>(false);
  isGuestLoggingIn = signal<boolean>(false);
  isLoggingIn = signal<boolean>(false);
  submitLoginError = signal<boolean>(false);
  loginError = signal<boolean>(false);
  isSigningUp = signal<boolean>(false);
  submitSignupError = signal<boolean>(false);
  signUpError = signal<boolean>(false);
  signUpSuccess = signal<boolean>(false);
  isNavigating = signal(false);
  
  showLogInPassword = signal<boolean>(false);
  showSignUpPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  
  greeting = computed<string>(() => getGreeting());

  confirmPassword: string = '';
  user$ = this.authService.user$;
  // navigationTimer?: any;

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
    const state = history.state;

    if (state?.openSignUp) {
      this.showSignUp.set(true);
    }

    if (!state?.skipIntro) {
      this.showIntro();
    } else {
      this.introActive.set(false);
      this.logoMoving.set(true);
    }
  }

  /**
   * Checks the current screen size.
   *
   * Updates the mobile state based
   * on the viewport width.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 1025);
  }

  /**
   * Plays the intro animation sequence.
   *
   * @returns void
   */
  showIntro(): void {
    setTimeout(() => {
      this.logoMoving.set(true);
    }, 300);

    setTimeout(() => {
      this.introActive.set(false);
    }, 1400);
  }

  /**
   * Opens the sign-up form.
   *
   * @returns void
   */
  openSignUp(): void {
    this.showSignUp.set(true);
  }

  /**
   * Closes the sign-up form.
   *
   * @returns void
   */
  closeSignUp(): void {
    this.showSignUp.set(false);

    setTimeout(() => {
      this.loginTitle()?.nativeElement.focus();
    });
  }

  /**
   * Toggles visibility of the login password field.
   *
   * @returns void
   */
  toggleLogInPassword(): void {
    this.showLogInPassword.update((show) => !show);
  }

  /**
   * Toggles visibility of the sign-up password field.
   *
   * @returns void
   */
  toggleSignUpPassword(): void {
    this.showSignUpPassword.update((show) => !show);
  }

  /**
   * Toggles visibility of the confirm-password field.
   *
   * @returns void
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((show) => !show);
  }

  /**
   * Handles the login process.
   *
   * Validates the login form, initiates authentication,
   * and triggers the corresponding success or error flow.
   *
   * @param form The login form instance
   * @returns void
   */
  onLogin(form: NgForm): void {
    if (this.isLoggingIn()) return;
    if (this.isLoginFormInvalid(form)) return;

    this.isLoggingIn.set(true);
    this.loginError.set(false);

    this.authService.logIn(this.logInData.email, this.logInData.password).subscribe({
      next: () => {
        this.onLoginSuccess();
      },
      error: () => {
        this.onLoginError();
      },
    });
  }

  /**
   * Validates the login form state.
   *
   * Marks all form controls as touched when
   * the form validation fails.
   *
   * @param form The login form instance
   * @returns True if the form is invalid
   */
  isLoginFormInvalid(form: NgForm): boolean {
    if (form.invalid) {
      this.submitLoginError.set(true);
      form.control.markAllAsTouched();
      return true;
    }
    this.submitLoginError.set(false);
    return false;
  }

  /**
   * Handles a successful login.
   *
   * Resets the loading state and performs
   * post-login navigation.
   *
   * @returns void
   */
  onLoginSuccess(): void {
    this.isLoggingIn.set(false);
    this.handleLoginNavigation();
  }

  /**
   * Handles a login error.
   *
   * Logs the error and updates the UI
   * to reflect the failed login attempt.
   *
   * @param err The error returned during login
   * @returns void
   */
  onLoginError(): void {
    this.isLoggingIn.set(false);
    this.loginError.set(true);
  }

  /**
   * Logs in the user as a guest.
   *
   * @returns void
   */
  guestLogin(): void {
    if (this.isGuestLoggingIn()) return;
    this.isGuestLoggingIn.set(true);

    this.authService.guestLogIn().subscribe({
      next: () => {
        this.handleLoginNavigation();
        this.isGuestLoggingIn.set(false);
      },
      error: (err) => {
        console.error('Guest login failed', err);
        this.isGuestLoggingIn.set(false);
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
    this.isNavigating.set(true);
    
    if (this.isMobile()) {
      this.showMobileGreeting.set(true);

      setTimeout(() => {
        this.showMobileGreeting.set(false);
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
    if (this.isSigningUp()) return;
    if (this.isSignUpFormInvalid(form)) return;

    this.isSigningUp.set(true);
    this.signUpError.set(false);

    this.authService
      .signUp(this.signUpData.name, this.signUpData.email, this.signUpData.password)
      .subscribe({
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
      this.submitSignupError.set(true);
      form.control.markAllAsTouched();
      return true;
    }
    this.submitSignupError.set(false);
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
    this.isSigningUp.set(false);
    this.confirmPassword = '';
    this.signUpData = {
      name: '',
      email: '',
      password: '',
    };
    this.closeSignUp();
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
    this.isSigningUp.set(false);
    this.signUpError.set(true);
  }

  /**
   * Displays a temporary success toast.
   *
   * @returns void
   */
  showToast(): void {
    this.signUpSuccess.set(true);

    setTimeout(() => {
      this.signUpSuccess.set(false);
    }, 2500);
  }
}
