import { Component, EventEmitter, Input, Output } from '@angular/core';

export type NavbarVariant = 'dark' | 'light';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  /** dark = fond gris foncé (dashboard), light = fond blanc (Email Communications) */
  @Input() variant: NavbarVariant = 'dark';

  @Input() pageTitle = 'Administration ESPRIT Connect';

  @Input() notificationCount = 0;

  @Input() userName = 'Admin';
  @Input() userRole = 'Super Admin';

  /** true = petit écran, affiche hamburger */
  @Input() showMenuToggle = false;

  @Output() menuToggle = new EventEmitter<void>();

  onToggle(): void {
    this.menuToggle.emit();
  }
}