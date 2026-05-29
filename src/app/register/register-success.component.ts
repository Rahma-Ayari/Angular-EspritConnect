import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-success',
  templateUrl: './register-success.component.html',
  styleUrls: ['./register-success.component.css']
})
export class RegisterSuccessComponent implements OnInit {

  email: string = '';
  verificationUrl: string | null = null;
  resendMessage = '';
  resendError = '';
  isResending = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || 'votre email';
    this.verificationUrl = this.route.snapshot.queryParamMap.get('verificationUrl');
  }

  resendEmail(): void {
    if (!this.email || this.email === 'votre email') {
      return;
    }
    this.isResending = true;
    this.resendMessage = '';
    this.resendError = '';
    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (res) => {
        this.isResending = false;
        this.resendMessage = res.message;
      },
      error: (err) => {
        this.isResending = false;
        this.resendError = err.error?.message || 'Impossible d\'envoyer l\'email.';
      }
    });
  }

  goToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
