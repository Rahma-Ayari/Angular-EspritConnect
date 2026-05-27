import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EntrepriseRoutingModule } from './entreprise-routing.module';
import { EntrepriseJobsComponent } from './pages/jobs/entreprise-jobs.component';
import { EntrepriseProfileComponent } from './pages/profile/entreprise-profile.component';

@NgModule({
  declarations: [EntrepriseJobsComponent, EntrepriseProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EntrepriseRoutingModule
  ]
})
export class EntrepriseModule { }
