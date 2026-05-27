import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserApprovalsComponent } from './pages/user-management/user-approvals/user-approvals.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminGeneralSettingsComponent } from '../admin-general-settings/admin-general-settings.component';
import { AdminRegionalSettingsComponent } from '../admin-regional-settings/admin-regional-settings.component';
import { AdminRegistrationSettingsComponent } from '../admin-registration-settings/admin-registration-settings.component';
import { JobsSettingsComponent } from './pages/jobs/jobs-settings.component';
import { JobsImportComponent } from './pages/jobs/jobs-import.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    UserApprovalsComponent,
    AdminDashboardComponent,
    AdminGeneralSettingsComponent,
    AdminRegionalSettingsComponent,
    AdminRegistrationSettingsComponent,
    JobsSettingsComponent,
    JobsImportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
