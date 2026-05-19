import { Component, OnInit } from '@angular/core';
import { UserApprovalService } from '../../../services/user-approval.service';
import { UserApprovalStats } from '../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: UserApprovalStats | null = null;
  isLoading: boolean = true;

  constructor(private userApprovalService: UserApprovalService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.userApprovalService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.isLoading = false;
      }
    });
  }
}
