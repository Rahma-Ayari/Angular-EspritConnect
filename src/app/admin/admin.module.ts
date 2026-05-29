import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedLayoutModule } from '../shared/shared-layout.module';

// Layout Components
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

// Page Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserApprovalsComponent } from './pages/user-management/user-approvals/user-approvals.component';
import { EnterpriseVerificationComponent } from './pages/enterprise-verification/enterprise-verification.component';

@NgModule({
  declarations: [
    // Layout
    AdminLayoutComponent,
    // Pages
    DashboardComponent,
    UserApprovalsComponent,
    EnterpriseVerificationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    SharedLayoutModule
  ]
})
export class AdminModule { }
