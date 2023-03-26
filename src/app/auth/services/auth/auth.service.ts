import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import {
  AuthState,
  SigninResponse,
  SignupResponse,
} from '../../models/auth.models';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private dbBaseUrl = environment.dbBaseUrl;
  private signUpUrl = environment.signUpUrl;
  private signInUrl = environment.signInUrl;

  private initialAuthState: AuthState = {
    isLoggedIn: false,
    isLoading: false,
    error: null,
    user: null,
    idToken: '',
    refreshToken: '',
    expirationTime: '',
  };

  private authState = new BehaviorSubject<AuthState>(this.initialAuthState);
  readonly authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private matSnackBar: MatSnackBar
  ) {
    let _user = localStorage.getItem('user');
    if (_user) {
      this.nextAuthState(JSON.parse(_user) as User, false, null);
    }
  }

  signin(email: string, password: string) {
    this.nextAuthState(null, true, null);
    return this.http
      .post<SigninResponse>(this.signInUrl, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(
        map((res) => res.localId),
        switchMap(this.getUserById),
        tap(this.signinHandler),
        catchError(this.errorHandler)
      );
  }

  signup(displayName: string, email: string, password: string) {
    this.nextAuthState(null, true, null);
    return this.http
      .post<SignupResponse>(this.signUpUrl, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(
        switchMap(this.registerUserInDb(displayName, email)),
        tap(this.signinHandler),
        catchError(this.errorHandler)
      );
  }

  logout() {
    this.nextAuthState(null, false, null);
    localStorage.removeItem('user');
    this.router.navigate(['/signin']);
  }

  private registerUserInDb = (displayName: string, email: string) => {
    return (response: SignupResponse) => {
      return this.http
        .put<{ name: string }>(
          this.dbBaseUrl + `users/${response.localId}.json`,
          {
            displayName,
            email,
          }
        )
        .pipe(
          map((_) => {
            let _user: User = { displayName, email, id: response.localId };
            return _user;
          })
        );
    };
  };

  private getUserById = (id: string) => {
    return this.http
      .get<{ displayName: string; email: string }>(
        this.dbBaseUrl + `users/${id}.json`
      )
      .pipe(
        map((res) => {
          let _user: User = {
            displayName: res.displayName,
            email: res.email,
            id: id,
          };
          return _user;
        })
      );
  };

  signinHandler = (user: User) => {
    this.nextAuthState(user, false, null);
    localStorage.setItem('user', JSON.stringify(user));
    this.router.navigate(['/chat']);
  };

  private errorHandler = (err: HttpErrorResponse) => {
    let message: string;
    switch (err.error.error.message) {
      case 'EMAIL_EXISTS':
        message = 'The email address is already in use by another account';
        break;
      case 'OPERATION_NOT_ALLOWED':
        message = 'Server error, please try again later';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        message = 'Too many attempts, try again later';
        break;
      case 'EMAIL_NOT_FOUND':
        message = 'Email/Password incorrect, please try again';
        break;
      case 'INVALID_PASSWORD':
        message = 'Email/Password incorrect, please try again';
        break;
      case 'USER_DISABLED':
        message =
          'User account has been disabled, please contact with support team';
        break;
      default:
        message = 'Unkown error occured!';
    }
    this.nextAuthState(null, false, message);
    this.matSnackBar.open(message, 'Dismiss', { duration: 5000 });
    return of();
  };

  private nextAuthState = (
    user: User | null,
    isLoading: boolean,
    error: string | null
  ) => {
    if (user)
      this.authState.next({
        isLoggedIn: true,
        isLoading: false,
        error: null,
        user: user,
        idToken: '',
        refreshToken: '',
        expirationTime: '',
      });
    else
      this.authState.next({
        isLoggedIn: false,
        isLoading: isLoading,
        error: error,
        user: null,
        idToken: '',
        refreshToken: '',
        expirationTime: '',
      });
  };
}
