import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSuccessComponent } from './register/register-success.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminGeneralSettingsComponent } from './admin-general-settings/admin-general-settings.component';
import { AdminRegionalSettingsComponent } from './admin-regional-settings/admin-regional-settings.component';
import { AdminRegistrationSettingsComponent } from './admin-registration-settings/admin-registration-settings.component';

const routes: Routes = [
  // Temporary dev shortcut: open admin area directly.
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-success', component: RegisterSuccessComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // Temporary: guards disabled to work directly on admin UI.
  { path: 'admin/dashboard', component: AdminDashboardComponent /* canActivate: [AuthGuard, AdminGuard] */ },
  { path: 'admin/settings', redirectTo: 'admin/settings/general', pathMatch: 'full' },
  { path: 'admin/settings/general', component: AdminGeneralSettingsComponent },
  { path: 'admin/settings/regional', component: AdminRegionalSettingsComponent },
  { path: 'admin/settings/registration', component: AdminRegistrationSettingsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
