import { Component, OnInit } from '@angular/core';
import { SupportService } from '../../services/support.service';
import { AuthService } from '../../services/auth.service';
import { SupportTicket } from '../../models/support.model';

@Component({
  selector: 'app-support-dashboard',
  templateUrl: './support-dashboard.component.html',
  styleUrls: ['./support-dashboard.component.css']
})
export class SupportDashboardComponent implements OnInit {
  myTickets: SupportTicket[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private supportService: SupportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyTickets();
  }

  loadMyTickets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.supportService.getMyTickets().subscribe({
      next: (data) => {
        this.myTickets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tickets:', err);
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'You must be logged in to view your tickets. Please log in and try again.';
        } else {
          this.errorMessage = 'Could not load tickets. The server may be unavailable.';
        }
      }
    });
  }
}
