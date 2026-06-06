import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ForumHomeComponent } from './pages/forum-home/forum-home.component';
import { ForumDetailComponent } from './pages/forum-detail/forum-detail.component';
import { ForumGroupsComponent } from './pages/forum-groups/forum-groups.component';
import { ForumGroupDetailComponent } from './pages/forum-group-detail/forum-group-detail.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { CreatePostStepperComponent } from './components/create-post-stepper/create-post-stepper.component';
import { StepIdentityComponent } from './components/create-post-stepper/step-identity/step-identity.component';
import { StepSettingsComponent } from './components/create-post-stepper/step-settings/step-settings.component';
import { StepReviewComponent } from './components/create-post-stepper/step-review/step-review.component';

@NgModule({
  declarations: [
    ForumHomeComponent,
    ForumDetailComponent,
    ForumGroupsComponent,
    ForumGroupDetailComponent,
    PostCardComponent,
    CreatePostStepperComponent,
    StepIdentityComponent,
    StepSettingsComponent,
    StepReviewComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ForumClientModule {}

