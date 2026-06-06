import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedLayoutModule } from '../shared/shared-layout.module';
import { StudentJobsRoutingModule } from './student-jobs-routing.module';
import { StudentJobsLayoutComponent } from './layout/student-jobs-layout.component';
import { DiscoverJobsComponent } from './pages/discover-jobs/discover-jobs.component';
import { RecommendedJobsComponent } from './pages/recommended-jobs/recommended-jobs.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { SavedJobsComponent } from './pages/saved-jobs/saved-jobs.component';
import { CareerAssistantComponent } from './pages/career-assistant/career-assistant.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';
import { StudentJobCardComponent } from './components/job-card/job-card.component';
import { MatchScoreCardComponent } from './components/match-score-card/match-score-card.component';
import { ApplicationTrackerComponent } from './components/application-tracker/application-tracker.component';
import { SavedJobsListComponent } from './components/saved-jobs-list/saved-jobs-list.component';
import { CvUploaderComponent } from './components/cv-uploader/cv-uploader.component';
import { CoverLetterGeneratorComponent } from './components/cover-letter-generator/cover-letter-generator.component';
import { AiInsightsPanelComponent } from './components/ai-insights-panel/ai-insights-panel.component';

@NgModule({
  declarations: [
    StudentJobsLayoutComponent,
    DiscoverJobsComponent,
    RecommendedJobsComponent,
    MyApplicationsComponent,
    SavedJobsComponent,
    CareerAssistantComponent,
    JobDetailsComponent,
    StudentJobCardComponent,
    MatchScoreCardComponent,
    ApplicationTrackerComponent,
    SavedJobsListComponent,
    CvUploaderComponent,
    CoverLetterGeneratorComponent,
    AiInsightsPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedLayoutModule,
    StudentJobsRoutingModule
  ]
})
export class StudentJobsModule {}
