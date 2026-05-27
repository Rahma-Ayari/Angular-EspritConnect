import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
// DEV: auth guards disabled while building admin + job dashboards
// import { AuthGuard, AdminGuard } from './guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSuccessComponent } from './register/register-success.component';
import { JobSearchComponent } from './jobs/job-search/job-search.component';
import { JobOfferDetailComponent } from './jobs/job-offer-detail/job-offer-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  // DEV: login/register kept but not required to access dashboards
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-success', component: RegisterSuccessComponent },
  { path: 'dashboard', component: DashboardComponent /* , canActivate: [AuthGuard] */ },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
    // canActivate: [AuthGuard, AdminGuard]
  },
  { path: 'entreprise', redirectTo: 'admin/jobs', pathMatch: 'prefix' },
  { path: 'jobs', component: JobSearchComponent },
  { path: 'jobs/:id', component: JobOfferDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
