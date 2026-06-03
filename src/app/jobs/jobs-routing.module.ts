import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsLayoutComponent } from './components/jobs-layout/jobs-layout.component';
import { AllJobsComponent } from './components/all-jobs/all-jobs.component';
import { CreateJobComponent } from './components/create-job/create-job.component';
import { ImportJobComponent } from './components/import-job/import-job.component';
import { ArchivedJobsComponent } from './components/archived-jobs/archived-jobs.component';
import { AiGeneratorComponent } from './components/ai-generator/ai-generator.component';

const routes: Routes = [
  {
    path: '',
    component: JobsLayoutComponent,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: AllJobsComponent },
      { path: 'create', component: CreateJobComponent },
      { path: 'ai-generator', component: AiGeneratorComponent },
      { path: 'edit/:id', component: CreateJobComponent },
      { path: 'import', component: ImportJobComponent },
      { path: 'archived', component: ArchivedJobsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsRoutingModule {}
