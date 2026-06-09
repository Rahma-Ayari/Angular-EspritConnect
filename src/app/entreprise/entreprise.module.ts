import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EntrepriseRoutingModule } from './entreprise-routing.module';

// Page Components
import { EntrepriseDashboardComponent } from './pages/dashboard/entreprise-dashboard.component';
import { VerificationStatusComponent } from './pages/verification-status/verification-status.component';
import { EntrepriseProfilComponent } from './pages/profil/entreprise-profil.component';

@NgModule({
  declarations: [
    EntrepriseDashboardComponent,
    VerificationStatusComponent,
    EntrepriseProfilComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EntrepriseRoutingModule
  ]
})
export class EntrepriseModule { }
