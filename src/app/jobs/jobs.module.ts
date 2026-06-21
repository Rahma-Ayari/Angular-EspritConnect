import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobsRoutingModule } from './jobs-routing.module';

// Components
import { JobsLayoutComponent } from './components/jobs-layout/jobs-layout.component';
import { AllJobsComponent } from './components/all-jobs/all-jobs.component';
import { CreateJobComponent } from './components/create-job/create-job.component';
import { ImportJobComponent } from './components/import-job/import-job.component';
import { ArchivedJobsComponent } from './components/archived-jobs/archived-jobs.component';
import { AiGeneratorComponent } from './components/ai-generator/ai-generator.component';

// Dashboard AI components
import { TopMatchesPanelComponent } from './components/dashboard/top-matches-panel/top-matches-panel.component';
import { CandidateDrawerComponent } from './components/dashboard/candidate-drawer/candidate-drawer.component';
import { AiInsightsPanelComponent } from './components/dashboard/ai-insights-panel/ai-insights-panel.component';
import { AiOutputPanelComponent } from './components/shared/ai-output-panel/ai-output-panel.component';

// Shared Components
import { JobCardComponent } from './components/shared/job-card/job-card.component';
import { JobTableComponent } from './components/shared/job-table/job-table.component';
import { StatusBadgeComponent } from './components/shared/status-badge/status-badge.component';
import { ActionDropdownComponent } from './components/shared/action-dropdown/action-dropdown.component';
import { SkillTagsInputComponent } from './components/shared/skill-tags-input/skill-tags-input.component';
import { AIAssistantPanelComponent } from './components/shared/ai-assistant-panel/ai-assistant-panel.component';
import { JobFormWizardComponent } from './components/shared/job-form-wizard/job-form-wizard.component';
import { RichTextEditorComponent } from './components/shared/rich-text-editor/rich-text-editor.component';

// Services
import { JobsService } from './services/jobs.service';
import { JobAIService } from './services/job-ai.service';
import { JobsAiService } from './ai/ai.service';

@NgModule({
  declarations: [
    // Layout
    JobsLayoutComponent,
    
    // Pages
    AllJobsComponent,
    CreateJobComponent,
    ImportJobComponent,
    ArchivedJobsComponent,
    AiGeneratorComponent,

    // Dashboard
    TopMatchesPanelComponent,
    CandidateDrawerComponent,
    AiInsightsPanelComponent,
    AiOutputPanelComponent,
    
    // Shared Components
    JobCardComponent,
    JobTableComponent,
    StatusBadgeComponent,
    ActionDropdownComponent,
    SkillTagsInputComponent,
    AIAssistantPanelComponent,
    JobFormWizardComponent,
    RichTextEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JobsRoutingModule
  ],
  providers: [
    JobsService,
    JobAIService,
    JobsAiService
  ]
})
export class JobsModule {}
