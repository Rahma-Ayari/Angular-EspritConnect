import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  mfaForm!: FormGroup;
  isLoading   = false;
  showPassword = false;
  errorMessage = '';
  isMfaRequired = false;
  mfaPendingToken = '';
  private readonly oauthBaseUrl = environment.backendBaseUrl || environment.apiUrl.replace(/\/api$/, '');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
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
        if (err.status === 403 && err.error?.code === 'EMAIL_NOT_VERIFIED') {
          this.errorMessage = err.error?.message || 'Veuillez vérifier votre email.';
        } else {
          this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
        }
      }
    });
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

  loginWithGoogle(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/google`;
  }

  loginWithLinkedIn(): void {
    window.location.href = `${this.oauthBaseUrl}/oauth2/authorization/linkedin`;
  }
}
