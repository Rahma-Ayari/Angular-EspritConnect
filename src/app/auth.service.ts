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

export interface RegisterResponse {
  message: string;
  email: string;
  emailVerificationRequired: boolean;
  verificationUrl?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  role: string;
  nom: string;
  email: string;
  scoreReadiness: number;
  userId: string;
  mfaRequired?: boolean;
  mfaPendingToken?: string;
  deviceToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = 'http://localhost:8088/espritconnect/api/auth';
  private readonly TOKEN_KEY = 'esprit_token';
  private readonly USER_KEY  = 'esprit_user';
  private readonly DEVICE_TOKEN_KEY = 'esprit_device_token';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.storedUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  login(req: LoginRequest, deviceToken?: string): Observable<AuthResponse> {
    const payload = deviceToken ? { ...req, deviceToken } : req;
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => {
        if (res.mfaRequired) {
          this.clearSessionOnly();
        } else {
          this.storeSession(res);
        }
      })
    );
  }

  verify2fa(email: string, code: string, rememberDevice: boolean, mfaPendingToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/verify-2fa-login`, {
      email,
      code,
      rememberDevice,
      mfaPendingToken
    }).pipe(
      tap(res => {
        this.storeSession(res);
        if (res.deviceToken) {
          localStorage.setItem(this.DEVICE_TOKEN_KEY, res.deviceToken);
        }
      })
    );
  }

  getDeviceToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.DEVICE_TOKEN_KEY);
    }
    return null;
  }

  // ── 2FA Settings & Actions ──────────────────────────────────────────────────
  get2faStatus(): Observable<{twoFactorEnabled: boolean, backupCodesCount: number, mfaApplicable: boolean}> {
    return this.http.get<{twoFactorEnabled: boolean, backupCodesCount: number, mfaApplicable: boolean}>(`${this.API}/2fa/status`);
  }

  setup2fa(): Observable<{secret: string, qrCode: string}> {
    return this.http.post<{secret: string, qrCode: string}>(`${this.API}/2fa/setup`, {});
  }

  verifyAndEnable2fa(code: string): Observable<{success: boolean, backupCodes: string[]}> {
    return this.http.post<{success: boolean, backupCodes: string[]}>(`${this.API}/2fa/verify`, { code });
  }

  disable2fa(password: string, code: string): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.API}/2fa/disable`, { password, code });
  }

  regenerateBackupCodes(password: string, code: string): Observable<{success: boolean, backupCodes: string[]}> {
    return this.http.post<{success: boolean, backupCodes: string[]}>(`${this.API}/2fa/regenerate-backup-codes`, { password, code });
  }

  getLoginHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/2fa/login-history`);
  }

  // ── Register ───────────────────────────────────────────────────────────────
  register(req: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API}/register`, req);
  }

  verifyEmail(token: string): Observable<{ message: string; success: boolean }> {
    return this.http.get<{ message: string; success: boolean }>(
      `${this.API}/verify-email`,
      { params: { token } }
    );
  }

  resendVerificationEmail(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/resend-verification-email`, { email });
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
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

  private clearSessionOnly(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
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
