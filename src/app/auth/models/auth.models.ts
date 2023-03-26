import { User } from './user.model';

export interface SignupResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

export interface SigninResponse extends SignupResponse {
  registered: true;
}

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  idToken: string;
  refreshToken: string;
  expirationTime: string;
}
