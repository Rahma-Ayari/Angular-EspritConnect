import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      { path: 'settings', redirectTo: 'settings/general', pathMatch: 'full' },
      { path: 'settings/general', component: AdminGeneralSettingsComponent },
      { path: 'settings/regional', component: AdminRegionalSettingsComponent },
      { path: 'settings/registration', component: AdminRegistrationSettingsComponent },
      { path: 'settings/homepage', component: AdminHomepageSettingsComponent },

      { path: 'jobs', redirectTo: 'jobs/settings', pathMatch: 'full' },
      { path: 'jobs/settings', component: JobsSettingsComponent },
      { path: 'jobs/import', component: JobsImportComponent },

      { path: 'user-management/approval', component: UserApprovalsComponent },
      { path: 'user-management/enterprise-verification', component: EnterpriseVerificationComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
