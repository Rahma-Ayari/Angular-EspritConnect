import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntrepriseRoutingModule } from './entreprise-routing.module';
import { EntrepriseJobsComponent } from './pages/jobs/entreprise-jobs.component';

@NgModule({
  declarations: [EntrepriseJobsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EntrepriseRoutingModule
  ]
})
export class EntrepriseModule {}
