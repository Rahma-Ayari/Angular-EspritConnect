import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { 
  EnterpriseVerificationService, 
  EnterpriseVerification 
} from '../../../services/enterprise-verification.service';

@Component({
  selector: 'app-entreprise-dashboard',
  templateUrl: './entreprise-dashboard.component.html',
  styleUrls: ['./entreprise-dashboard.component.css']
})
export class EntrepriseDashboardComponent implements OnInit {
  verification: EnterpriseVerification | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private verificationService: EnterpriseVerificationService
  ) {}

  ngOnInit(): void {
    this.loadVerificationStatus();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  loadVerificationStatus(): void {
    this.verificationService.getMyVerificationStatus().subscribe({
      next: (data) => {
        this.verification = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.verificationService.getStatusLabel(status as any);
  }

  getStatusClass(status: string): string {
    return this.verificationService.getStatusClass(status as any);
  }
}
