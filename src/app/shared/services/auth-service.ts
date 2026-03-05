import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from '@angular/fire/auth';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { FirebaseService } from './firebase-service';
import { capitalizeFullname, setUserColor } from '../utilities/utils';

@Injectable({
  providedIn: 'root',
})
/**
 * AuthService
 *
 * Handles user authentication and authorization logic.
 * Provides login, guest login, sign-up, and logout functionality,
 * and exposes authentication state as observables.
 */
export class AuthService {
  firebaseAuth = inject(Auth);
  contactService = inject(FirebaseService);

  private authLoadingSubject = new BehaviorSubject<boolean>(true);
  authLoading$ = this.authLoadingSubject.asObservable();

  user$ = authState(this.firebaseAuth).pipe(
    tap(() => this.authLoadingSubject.next(false))
  );

  /**
   * Logs in a user using email and password.
   *
   * @param email The user's email address
   * @param password The user's password
   * @returns An observable emitting the user credentials
   */
  logIn(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password);
    return from(promise);
  }

  /**
   * Logs in a user anonymously.
   *
   * @returns An observable emitting the user credentials
   */
  guestLogIn(): Observable<UserCredential> {
    const promise = signInAnonymously(this.firebaseAuth);
    return from(promise);
  }

  /**
   * Registers a new user account.
   *
   * Creates the authentication user, updates the user profile,
   * and creates a corresponding contact entry in the database.
   *
   * @param name The user's full name
   * @param email The user's email address
   * @param password The user's password
   * @returns An observable emitting the user credentials
   */
  signUp(name: string, email: string, password: string): Observable<UserCredential> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(async (response) => {
      await updateProfile(response.user, { displayName: name });

      await this.contactService.addDocument({
        name: capitalizeFullname(name),
        email: email,
        phone: '',
        isAvailable: true,
        userColor: setUserColor(),
      });

      return response;
    });

    return from(promise);
  }

  /**
   * Logs out the currently authenticated user.
   *
   * @returns An observable that completes when logout is finished
   */
  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
