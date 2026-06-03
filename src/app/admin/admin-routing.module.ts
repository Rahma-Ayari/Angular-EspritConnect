import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserApprovalsComponent } from './pages/user-management/user-approvals/user-approvals.component';
import { EnterpriseVerificationComponent } from './pages/enterprise-verification/enterprise-verification.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'user-management/approval', component: UserApprovalsComponent },
      { path: 'user-management/enterprise-verification', component: EnterpriseVerificationComponent },
      { path: 'events', loadChildren: () => import('./events/events.module').then(m => m.EventsModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
