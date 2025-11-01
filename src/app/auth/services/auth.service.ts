import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../interfaces/user.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';


type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  });

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed(() => this._user());
  token = computed(this._token);
  //isAdmin = computed(() => this._user()?.positionId.includes('67f16e028d9f980b86ea0323') ?? false)

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/login`, {
        email: email,
        password: password,
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }
  
  registerBusiness(registrationPayload: any): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/register/business`, registrationPayload)
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  registerEmployee(
  fullName: string,
  identificationNumber: string,
  positionId: string,
  password: string,
  email: string
): Observable<boolean> {
  const businessId = this.user()?.businessId;

  if (!businessId) {
    return new Observable<boolean>((observer) => {
      observer.error('No businessId available.');
    });
  }

  return this.http
    .post<AuthResponse>(`${baseUrl}/auth/register/employee`, {
      fullName,
      identificationNumber,
      email,
      positionId,
      password,
      businessId,
    })
    .pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
}

  register(fullName: string, identificationNumber: string, positionId: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/register`, {
        fullName: fullName,
        identificationNumber: identificationNumber,
        positionId: positionId,
        password: password,
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }

    return this.http
      .get<AuthResponse>(`${baseUrl}/auth/verify`)
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  getUserModuleAccess(): Observable<string[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of([]);
    }
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const moduleAccess = decodedToken['moduleAccessId'] || [];
      console.log('Decoded Token:', decodedToken); // <-- Añade esto
      console.log('Module Access from Token:', moduleAccess); // <-- Añade esto
      return of(moduleAccess);
    } catch (e) {
      console.error('Error decoding token:', e); // <-- Captura errores de decodificación
      this.logout();
      return of([]);
    }
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.removeItem('token');
  }

  private handleAuthSuccess({ token, user }: AuthResponse) {
    this._user.set(user);
    this._authStatus.set('authenticated');
    this._token.set(token);

    localStorage.setItem('token', token);

    return true;
  }

  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }
}
