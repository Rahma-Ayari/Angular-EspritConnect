import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewModeService } from './shared/layout/services/view-mode.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular-EspritConnect';
  isUserView = false;
  private modeSub?: Subscription;

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    if (role && role !== 'ADMIN') {
      this.viewMode.syncFromRole(role);
    }

    this.modeSub = this.viewMode.currentMode$.subscribe((mode) => {
      const roleNow = this.authService.getRole();
      this.isUserView = roleNow !== 'ADMIN' || mode !== 'admin';
    });
  }

  ngOnDestroy(): void {
    this.modeSub?.unsubscribe();
  }
}
