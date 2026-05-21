import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

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

  private readonly API = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'esprit_token';
  private readonly USER_KEY  = 'esprit_user';
  private readonly REMEMBER_KEY = 'esprit_remember';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.storedUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  login(req: LoginRequest, rememberMe = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(res => this.storeSession(res, rememberMe))
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
      localStorage.removeItem(this.REMEMBER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem(this.REMEMBER_KEY) === 'true';
      return sessionStorage.getItem(this.TOKEN_KEY) || (remembered ? localStorage.getItem(this.TOKEN_KEY) : null);
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
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/user-management/approval']);
        break;
      case 'ENTREPRISE':
        this.router.navigate(['/entreprise/dashboard']);
        break;
      case 'ETUDIANT':
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  private storeSession(res: AuthResponse, rememberMe: boolean): void {
    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      storage.setItem(this.TOKEN_KEY, res.token);
      storage.setItem(this.USER_KEY, JSON.stringify(res));
      localStorage.setItem(this.REMEMBER_KEY, String(rememberMe));

      otherStorage.removeItem(this.TOKEN_KEY);
      otherStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(res);
  }

  private storedUser(): AuthResponse | null {
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem(this.REMEMBER_KEY) === 'true';
      const raw = sessionStorage.getItem(this.USER_KEY) || (remembered ? localStorage.getItem(this.USER_KEY) : null);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }
}
