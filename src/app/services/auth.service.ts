import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  etudiantId?: number;
}

interface AuthResponse {
  token: string;
  role: string;
  nom: string;
  email: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ADMIN_USER: User = {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Admin User',
    email: 'admin@esprit.tn',
    role: 'ADMIN'
  };

  private readonly STUDENT_USER: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Student User',
    email: 'student@esprit.tn',
    role: 'STUDENT',
    etudiantId: 1
  };

  private currentUserSubject = new BehaviorSubject<User>(this.STUDENT_USER);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('esprit_user');
      if (saved) {
        try {
          this.currentUserSubject.next(JSON.parse(saved));
        } catch { /* ignore */ }
      }
    }
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('esprit_token');
  }

  login(email: string, password: string): Observable<AuthResponse | null> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.applyAuthResponse(res)),
      catchError((err) => {
        console.error('Login failed for email: ' + email, err);

        // Graceful dev fallback if backend is down or errors out
        if (!environment.production) {
          console.warn('Backend login failed. Falling back to mock authentication for development.');
          const isEmailAdmin = email.includes('admin');
          const mockRes: AuthResponse = {
            token: 'mock-dev-jwt-token-for-' + (isEmailAdmin ? 'admin' : 'student'),
            role: isEmailAdmin ? 'ADMIN' : 'ETUDIANT',
            nom: isEmailAdmin ? 'Admin User' : 'Student User',
            email: email,
            userId: isEmailAdmin ? '00000000-0000-0000-0000-000000000000' : '123e4567-e89b-12d3-a456-426614174000'
          };
          this.applyAuthResponse(mockRes);
          return of(mockRes);
        }

        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('esprit_token');
          localStorage.removeItem('esprit_user');
        }
        return of(null);
      })
    );
  }

  loginAsCurrentRole(): Observable<AuthResponse | null> {
    const user = this.getCurrentUser();
    const creds = user.role === 'ADMIN' ? environment.devAuth.admin : environment.devAuth.student;
    return this.login(creds.email, creds.password);
  }

  toggleUserRole(): Observable<AuthResponse | null> {
    const nextRole = this.currentUserSubject.value.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    const creds = nextRole === 'ADMIN' ? environment.devAuth.admin : environment.devAuth.student;
    return this.login(creds.email, creds.password);
  }

  isLoggedInAsAdmin(): boolean {
    return this.currentUserSubject.value.role === 'ADMIN';
  }

  private setUser(user: User): void {
    this.currentUserSubject.next(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('esprit_user', JSON.stringify(user));
    }
  }

  private applyAuthResponse(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('esprit_token', res.token);
    }
    const role = (res.role === 'ADMIN' ? 'ADMIN' : 'STUDENT') as User['role'];
    this.setUser({
      id: res.userId,
      name: res.nom,
      email: res.email,
      role,
      etudiantId: role === 'STUDENT' ? 1 : undefined
    });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }
}
