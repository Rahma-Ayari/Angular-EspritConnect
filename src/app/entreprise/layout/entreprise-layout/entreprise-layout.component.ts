import { Component } from '@angular/core';

@Component({
  selector: 'app-entreprise-layout',
  templateUrl: './entreprise-layout.component.html',
  styleUrls: ['./entreprise-layout.component.css']
})
export class EntrepriseLayoutComponent {
  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
