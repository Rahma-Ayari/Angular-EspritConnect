import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { CaptchaVerifiedState } from '../../shared/captcha/captcha.models';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  captchaVerified = false;
  captchaState: CaptchaVerifiedState | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid || !this.captchaVerified || !this.captchaState) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.value.email;

    this.authService.forgotPassword(
      email,
      this.captchaState.captchaId,
      this.captchaState.captchaToken
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Reset link sent.';
      },
      error: (err) => {
        this.isLoading = false;
        // Optional : ne pas afficher d'erreur spécifique pour ne pas divulguer l'existence des emails
        this.errorMessage = err.error?.error || err.error?.message || 'An error occurred. Please try again.';
      }
    });
  }

  onCaptchaVerified(state: CaptchaVerifiedState): void {
    this.captchaVerified = true;
    this.captchaState = state;
  }

  onCaptchaReset(): void {
    this.captchaVerified = false;
    this.captchaState = null;
  }
}
