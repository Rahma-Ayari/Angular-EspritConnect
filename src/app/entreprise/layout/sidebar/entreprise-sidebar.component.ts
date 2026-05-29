import { Component, Inject, PLATFORM_ID, OnInit, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-entreprise-sidebar',
  templateUrl: './entreprise-sidebar.component.html',
  styleUrls: ['./entreprise-sidebar.component.css']
})
export class EntrepriseSidebarComponent implements OnInit {
  @Input() collapsed = false;
  
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
