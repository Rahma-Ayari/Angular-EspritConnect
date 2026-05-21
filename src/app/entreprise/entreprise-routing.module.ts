import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrepriseLayoutComponent } from './layout/entreprise-layout/entreprise-layout.component';
import { EntrepriseDashboardComponent } from './pages/dashboard/entreprise-dashboard.component';
import { VerificationStatusComponent } from './pages/verification-status/verification-status.component';

const routes: Routes = [
  {
    path: '',
    component: EntrepriseLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EntrepriseDashboardComponent },
      { path: 'verification', component: VerificationStatusComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntrepriseRoutingModule { }
