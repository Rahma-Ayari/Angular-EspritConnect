import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent, AdminLayoutComponent],
  imports: [CommonModule, RouterModule],
  exports: [AdminLayoutComponent, NavbarComponent, SidebarComponent]
})
export class LayoutModule {}