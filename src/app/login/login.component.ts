import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  mfaForm!: FormGroup;
  isLoading   = false;
  showPassword = false;
  errorMessage = '';
  isMfaRequired = false;
  mfaPendingToken = '';
  remainingAttempts = 5;
  lockoutSeconds = 0;
  isAccountLocked = false;
  lockoutCountdown = '';
  private lockoutInterval: any;
  private googleAuthSub!: Subscription;
  private isProcessingGoogleLogin = false;
  private readonly oauthBaseUrl = environment.backendBaseUrl || environment.apiUrl.replace(/\/api$/, '');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:      [environment.production ? '' : environment.devAuth.admin.email, [Validators.required, Validators.email]],
      password:   [environment.production ? '' : environment.devAuth.admin.password, [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.mfaForm = this.fb.group({
      code:           ['', [Validators.required, Validators.minLength(6), Validators.maxLength(9)]],
      rememberDevice: [false]
    });

    // Subscribe to Google auth state — only process if the user actively clicked
    // the Google button (not a cached session replay after logout).
    this.googleAuthSub = this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken && !this.isProcessingGoogleLogin && !this.authService.isLoggedIn()) {
        this.isProcessingGoogleLogin = true;
        this.isLoading = true;
        this.errorMessage = '';
        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.isProcessingGoogleLogin = false;
            this.authService.redirectAfterLogin(res.role);
          },
          error: (err) => {
            this.isLoading = false;
            this.isProcessingGoogleLogin = false;
            this.errorMessage = err.error?.message || 'Erreur lors de la connexion avec Google.';
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }
    if (this.googleAuthSub) {
      this.googleAuthSub.unsubscribe();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isAccountLocked) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading    = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;
    const deviceToken = this.authService.getDeviceToken() || undefined;

    this.authService.login({ email, password }, deviceToken, !!rememberMe).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.mfaRequired) {
          this.isMfaRequired = true;
          this.mfaPendingToken = res.mfaPendingToken || '';
        } else {
          this.authService.redirectAfterLogin(res.role);
        }
      },
      error: (err) => {
        this.isLoading    = false;
        if (err.status === 423) { // ACCOUNT_LOCKED
          this.isAccountLocked = true;
          this.remainingAttempts = 0;
          this.lockoutSeconds = err.error?.lockoutSeconds || 900;
          this.startLockoutCountdown();
          this.errorMessage = err.error?.message || 'Votre compte est temporairement verrouillé.';
        } else if (err.status === 401) {
          this.remainingAttempts = err.error?.remainingAttempts !== undefined ? err.error.remainingAttempts : 5;
          if (this.remainingAttempts < 5) {
            this.errorMessage = `Email ou mot de passe incorrect. Il vous reste ${this.remainingAttempts} tentative(s).`;
          } else {
            this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
          }
        } else if (err.status === 403 && err.error?.code === 'EMAIL_NOT_VERIFIED') {
          this.errorMessage = err.error?.message || 'Veuillez vérifier votre email.';
        } else {
          this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
        }
      }
    });
  }

  startLockoutCountdown(): void {
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }
    
    this.loginForm.disable();
    this.updateCountdownText();
    
    this.lockoutInterval = setInterval(() => {
      this.lockoutSeconds--;
      if (this.lockoutSeconds <= 0) {
        this.isAccountLocked = false;
        this.remainingAttempts = 5;
        this.errorMessage = '';
        this.loginForm.enable();
        clearInterval(this.lockoutInterval);
      } else {
        this.updateCountdownText();
      }
    }, 1000);
  }

  updateCountdownText(): void {
    const minutes = Math.floor(this.lockoutSeconds / 60);
    const seconds = this.lockoutSeconds % 60;
    this.lockoutCountdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onMfaSubmit(): void {
    if (this.mfaForm.invalid) {
      this.mfaForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const email = this.loginForm.value.email;
    const { code, rememberDevice } = this.mfaForm.value;

    if (!this.mfaPendingToken) {
      this.isLoading = false;
      this.errorMessage = 'Session 2FA expirée. Veuillez vous reconnecter avec votre mot de passe.';
      return;
    }

    this.authService.verify2fa(email, code, rememberDevice, this.mfaPendingToken).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.authService.redirectAfterLogin(res.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Code double authentification incorrect ou expiré.';
      }
    });
  }

  cancelMfa(): void {
    this.isMfaRequired = false;
    this.mfaPendingToken = '';
    this.errorMessage = '';
    this.mfaForm.reset();
  }

  loginWithLinkedIn(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/linkedin`;
  }
}
