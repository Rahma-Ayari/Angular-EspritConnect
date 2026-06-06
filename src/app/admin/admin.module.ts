import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedLayoutModule } from '../shared/shared-layout.module';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserApprovalsComponent } from './pages/user-management/user-approvals/user-approvals.component';
import { EnterpriseVerificationComponent } from './pages/enterprise-verification/enterprise-verification.component';
import { AdminGeneralSettingsComponent } from '../admin-general-settings/admin-general-settings.component';
import { AdminRegionalSettingsComponent } from '../admin-regional-settings/admin-regional-settings.component';
import { AdminRegistrationSettingsComponent } from '../admin-registration-settings/admin-registration-settings.component';
import { AdminHomepageSettingsComponent } from './pages/settings/admin-homepage-settings.component';
import { JobsSettingsComponent } from './pages/jobs/jobs-settings.component';
import { JobsImportComponent } from './pages/jobs/jobs-import.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    UserApprovalsComponent,
    EnterpriseVerificationComponent,
    AdminGeneralSettingsComponent,
    AdminRegionalSettingsComponent,
    AdminRegistrationSettingsComponent,
    AdminHomepageSettingsComponent,
    JobsSettingsComponent,
    JobsImportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    AdminRoutingModule,
    SharedLayoutModule
  ]
})
export class AdminModule { }
