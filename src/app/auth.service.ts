import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  role: string;
  niveau?: string;
  filiere?: string;
  diplome?: string;
  photo?: string;
  anneePromotion?: number;
  domaine?: string;
  disponibleMentorat?: boolean;
  entrepriseActuelle?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  role: string;
  nom: string;
  email: string;
  scoreReadiness: number;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  /** Relative URL → Angular dev-server proxy → http://127.0.0.1:8087 */
  private readonly API = '/espritconnect/api/auth';
  private readonly TOKEN_KEY = 'esprit_token';
  private readonly USER_KEY  = 'esprit_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.storedUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(res => this.storeSession(res))
    );
  }

  // ── Register ───────────────────────────────────────────────────────────────
  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, req);
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  // ── Redirect after login ───────────────────────────────────────────────────
  redirectAfterLogin(role: string): void {
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      // All non-admin users go to frontoffice dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  private storeSession(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    }
    this.currentUserSubject.next(res);
  }

  private storedUser(): AuthResponse | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }
}
