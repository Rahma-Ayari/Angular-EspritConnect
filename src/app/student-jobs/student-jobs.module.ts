import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentJobsRoutingModule } from './student-jobs-routing.module';
import { StudentJobsLayoutComponent } from './layout/student-jobs-layout.component';
import { DiscoverJobsComponent } from './pages/discover-jobs/discover-jobs.component';
import { RecommendedJobsComponent } from './pages/recommended-jobs/recommended-jobs.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { SavedJobsComponent } from './pages/saved-jobs/saved-jobs.component';
import { CareerAssistantComponent } from './pages/career-assistant/career-assistant.component';
import { ResumeStudioComponent } from './pages/resume-studio/resume-studio.component';
import { CoverLettersComponent } from './pages/cover-letters/cover-letters.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';
import { StudentJobCardComponent } from './components/job-card/job-card.component';
import { MatchScoreCardComponent } from './components/match-score-card/match-score-card.component';
import { ApplicationTrackerComponent } from './components/application-tracker/application-tracker.component';
import { SavedJobsListComponent } from './components/saved-jobs-list/saved-jobs-list.component';
import { CvUploaderComponent } from './components/cv-uploader/cv-uploader.component';
import { CoverLetterGeneratorComponent } from './components/cover-letter-generator/cover-letter-generator.component';
import { AiInsightsPanelComponent } from './components/ai-insights-panel/ai-insights-panel.component';
import { AiResultPanelComponent } from './components/ai-result-panel/ai-result-panel.component';
import { AiJobMatchPanelComponent } from './components/ai-job-match-panel/ai-job-match-panel.component';
import { ApplyModalComponent } from './components/apply-modal/apply-modal.component';

@NgModule({
  declarations: [
    StudentJobsLayoutComponent,
    DiscoverJobsComponent,
    RecommendedJobsComponent,
    MyApplicationsComponent,
    SavedJobsComponent,
    CareerAssistantComponent,
    ResumeStudioComponent,
    CoverLettersComponent,
    JobDetailsComponent,
    StudentJobCardComponent,
    MatchScoreCardComponent,
    ApplicationTrackerComponent,
    SavedJobsListComponent,
    CvUploaderComponent,
    CoverLetterGeneratorComponent,
    AiInsightsPanelComponent,
    AiResultPanelComponent,
    AiJobMatchPanelComponent,
    ApplyModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    StudentJobsRoutingModule
  ]
})
export class StudentJobsModule {}
