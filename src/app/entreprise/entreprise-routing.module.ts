import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrepriseDashboardComponent } from './pages/dashboard/entreprise-dashboard.component';
import { VerificationStatusComponent } from './pages/verification-status/verification-status.component';
import { EntrepriseProfilComponent } from './pages/profil/entreprise-profil.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EntrepriseDashboardComponent },
  {
    path: 'jobs',
    loadChildren: () => import('../jobs/jobs.module').then((m) => m.JobsModule)
  },
  { path: 'verification', component: VerificationStatusComponent },
  { path: 'profil', component: EntrepriseProfilComponent },
  { path: 'offres', redirectTo: 'jobs/all', pathMatch: 'full' },
  { path: 'candidatures', redirectTo: 'jobs/all', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntrepriseRoutingModule { }
