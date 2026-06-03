import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jobs-layout',
  templateUrl: './jobs-layout.component.html',
  styleUrls: ['./jobs-layout.component.css']
})
export class JobsLayoutComponent {
  constructor(private router: Router) {}

  /** Header + action cards only on the main job offers list */
  get showOverview(): boolean {
    const url = this.router.url.split('?')[0];
    return url.endsWith('/jobs/all') || url.endsWith('/jobs');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
