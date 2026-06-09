import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ViewModeService } from './shared/layout/services/view-mode.service';
import { AuthService } from './auth.service';

/** Routes where the floating chatbot must never appear. */
const CHATBOT_HIDDEN_ROUTES = ['/login', '/register', '/register-success', '/verify-email'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular-EspritConnect';
  isUserView = false;
  private modeSub?: Subscription;
  private authSub?: Subscription;
  private routeSub?: Subscription;
  private currentUrl = '';

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;

    const role = this.authService.getRole();
    if (role && role !== 'ADMIN') {
      this.viewMode.syncFromRole(role);
    }

    this.updateChatbotVisibility(this.viewMode.getCurrentMode());

    this.modeSub = this.viewMode.currentMode$.subscribe((mode) => {
      this.updateChatbotVisibility(mode);
    });

    this.authSub = this.authService.currentUser$.subscribe(() => {
      this.updateChatbotVisibility(this.viewMode.getCurrentMode());
    });

    this.routeSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl = event.urlAfterRedirects;
      this.updateChatbotVisibility(this.viewMode.getCurrentMode());
    });
  }

  ngOnDestroy(): void {
    this.modeSub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  private updateChatbotVisibility(mode: string): void {
    const roleNow = this.authService.getRole();
    const loggedIn = this.authService.isLoggedIn();
    const onPublicAuthPage = CHATBOT_HIDDEN_ROUTES.some((path) =>
      this.currentUrl === path || this.currentUrl.startsWith(path + '?')
    );
    this.isUserView = loggedIn && !onPublicAuthPage && (roleNow !== 'ADMIN' || mode !== 'admin');
  }
}
