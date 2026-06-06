import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForumDashboardComponent } from './pages/forum-dashboard/forum-dashboard.component';
import { ForumCategoriesComponent } from './pages/forum-categories/forum-categories.component';
import { ForumPostsComponent } from './pages/forum-posts/forum-posts.component';
import { ForumGroupsModerationComponent } from './pages/forum-groups-moderation/forum-groups-moderation.component';

@NgModule({
  declarations: [
    ForumDashboardComponent,
    ForumCategoriesComponent,
    ForumPostsComponent,
    ForumGroupsModerationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    ForumDashboardComponent,
    ForumCategoriesComponent,
    ForumPostsComponent,
    ForumGroupsModerationComponent
  ]
})
export class ForumModule { }
