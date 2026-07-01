import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentJobsLayoutComponent } from './layout/student-jobs-layout.component';
import { DiscoverJobsComponent } from './pages/discover-jobs/discover-jobs.component';
import { RecommendedJobsComponent } from './pages/recommended-jobs/recommended-jobs.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { SavedJobsComponent } from './pages/saved-jobs/saved-jobs.component';
import { CareerAssistantComponent } from './pages/career-assistant/career-assistant.component';
import { ResumeStudioComponent } from './pages/resume-studio/resume-studio.component';
import { CoverLettersComponent } from './pages/cover-letters/cover-letters.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';

const routes: Routes = [
  {
    path: '',
    component: StudentJobsLayoutComponent,
    children: [
      { path: '', redirectTo: 'discover', pathMatch: 'full' },
      { path: 'discover', component: DiscoverJobsComponent },
      { path: 'recommended', component: RecommendedJobsComponent },
      { path: 'applications', component: MyApplicationsComponent },
      { path: 'saved', component: SavedJobsComponent },
      { path: 'resume-studio', component: ResumeStudioComponent },
      { path: 'cover-letters', component: CoverLettersComponent },
      { path: 'ai-assistant', component: CareerAssistantComponent },
      { path: ':id', component: JobDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentJobsRoutingModule {}
