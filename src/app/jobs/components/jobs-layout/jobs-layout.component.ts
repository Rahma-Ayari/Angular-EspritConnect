import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { navigateJobs } from '../../jobs-router.util';

@Component({
  selector: 'app-jobs-layout',
  templateUrl: './jobs-layout.component.html',
  styleUrls: ['./jobs-layout.component.css']
})
export class JobsLayoutComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /** Header + action cards only on the main job offers list */
  get showOverview(): boolean {
    const url = this.router.url.split('?')[0];
    return /\/jobs(\/all)?\/?$/.test(url);
  }

  navigateTo(segment: string): void {
    navigateJobs(this.router, this.route, [segment]);
  }
}
