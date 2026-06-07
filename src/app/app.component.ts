import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewModeService } from './shared/layout/services/view-mode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular-EspritConnect';
  isUserView = false;
  private modeSub?: Subscription;

  constructor(private readonly viewMode: ViewModeService) {}

  ngOnInit(): void {
    this.modeSub = this.viewMode.currentMode$.subscribe((mode) => {
      this.isUserView = mode !== 'admin';
    });
  }

  ngOnDestroy(): void {
    this.modeSub?.unsubscribe();
  }
}
