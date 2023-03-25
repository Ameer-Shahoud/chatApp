import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import {
  AuthState,
  SigninResponse,
  SignupResponse,
} from '../../models/auth.models';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private dbBaseUrl = environment.dbBaseUrl;
  private signUpUrl = environment.signUpUrl;
  private signInUrl = environment.signInUrl;

  private initialAuthState: AuthState = {
    isLoggedIn: false,
    user: null,
    idToken: '',
    refreshToken: '',
    expirationTime: '',
  };

  private authState = new BehaviorSubject<AuthState>(this.initialAuthState);
  readonly authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  signin(email: string, password: string) {
    return this.http.post<SigninResponse>(this.signInUrl, {
      email,
      password,
      returnSecureToken: true,
    });
  }

  signup(displayName: string, email: string, password: string) {
    return this.http
      .post<SignupResponse>(this.signUpUrl, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(switchMap(this.registerUserInDb(displayName, email)));
  }

  private registerUserInDb = (displayName: string, email: string) => {
    return (response: SignupResponse) => {
      return this.http
        .post<{ name: string }>(this.dbBaseUrl + 'users.json', {
          displayName,
          email,
        })
        .pipe(
          map((res) => {
            let _user: User = { displayName, email, id: res.name };
            return _user;
          })
        );
    };
  };

  private editAuthState(user: User) {}
}
