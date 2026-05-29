import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EntrepriseRoutingModule } from './entreprise-routing.module';
import { SharedLayoutModule } from '../shared/shared-layout.module';

// Layout Components
import { EntrepriseLayoutComponent } from './layout/entreprise-layout/entreprise-layout.component';

// Page Components
import { EntrepriseDashboardComponent } from './pages/dashboard/entreprise-dashboard.component';
import { VerificationStatusComponent } from './pages/verification-status/verification-status.component';

@NgModule({
  declarations: [
    // Layout
    EntrepriseLayoutComponent,
    // Pages
    EntrepriseDashboardComponent,
    VerificationStatusComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EntrepriseRoutingModule,
    SharedLayoutModule
  ]
})
export class EntrepriseModule { }
