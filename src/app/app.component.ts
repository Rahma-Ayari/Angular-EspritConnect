import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Angular-EspritConnect';
  isAdminView = true;
  currentUser: User | null = null;
  showWelcome = false;
  adminSupportOpen = true;
  userSupportOpen = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdminView = user?.role === 'ADMIN';
    });

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      const url = e.urlAfterRedirects.split('?')[0];
      this.showWelcome = url === '/admin/badges' || url === '/my-badges';

      // Auto-redirect if URL conflicts with current user role
      if (this.currentUser) {
        const isUrlAdmin = url.startsWith('/admin');
        const isUserAdmin = this.currentUser.role === 'ADMIN';

        if (isUrlAdmin && !isUserAdmin) {
          this.router.navigate(['/my-badges']);
        } else if (!isUrlAdmin && isUserAdmin && (url === '/my-badges' || url === '/support' || url.startsWith('/support/'))) {
          this.router.navigate(['/admin/badges']);
        }
      }
    });
  }

  toggleView() {
    this.authService.toggleUserRole().subscribe(res => {
      if (res) {
        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin/badges']);
        } else {
          this.router.navigate(['/my-badges']);
        }
      }
    });
  }
}
