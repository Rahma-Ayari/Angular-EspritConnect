import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';

// Layout Components
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

// Page Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserApprovalsComponent } from './pages/user-management/user-approvals/user-approvals.component';
import { EnterpriseVerificationComponent } from './pages/enterprise-verification/enterprise-verification.component';

@NgModule({
  declarations: [
    // Layout
    AdminLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    // Pages
    DashboardComponent,
    UserApprovalsComponent,
    EnterpriseVerificationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
