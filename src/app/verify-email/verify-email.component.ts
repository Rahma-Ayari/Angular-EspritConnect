import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

type VerifyState = 'loading' | 'success' | 'expired' | 'invalid' | 'missing';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  state: VerifyState = 'loading';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'missing';
      this.message = 'Lien invalide.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.state = 'success';
        this.message = 'Your account has been verified.';
      },
      error: (err) => {
        const code = err.error?.code;
        if (code === 'EXPIRED_TOKEN') {
          this.state = 'expired';
          this.message = 'Link expired.';
        } else {
          this.state = 'invalid';
          this.message = err.error?.message || 'Lien invalide.';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
