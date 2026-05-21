import { Component } from '@angular/core';

@Component({
  selector: 'app-user-sidebar',
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.css'
})
export class UserSidebarComponent {
  readonly items = [
    { label: 'Dashboard', link: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'Profile', link: '/profile', icon: 'profile' },
    { label: 'Mentoring', link: '/mentoring', icon: 'mentoring' },
    { label: 'Jobs', link: '/jobs', icon: 'jobs' },
    { label: 'Events', link: '/events', icon: 'events' },
    { label: 'Resources', link: '/resources', icon: 'resources' },
    { label: 'Info & Support', link: '/support', icon: 'support' }
  ];
}
