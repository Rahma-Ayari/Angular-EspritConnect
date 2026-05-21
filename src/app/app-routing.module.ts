import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDigestComponent } from './features/activity-digest/pages/activity-digest/activity-digest.component';
import { MessageUsersComponent } from './features/message-users/pages/message-users/message-users.component';
import { EmailHistoryComponent } from './features/email-history/pages/email-history/email-history.component';
import { AutomaticEmailsComponent } from './features/automatic-emails/pages/automatic-emails/automatic-emails.component';
import { MailingListsComponent } from './features/mailing-lists/pages/mailing-lists/mailing-lists.component';
import { ForumDashboardComponent } from './features/forum/pages/forum-dashboard/forum-dashboard.component';
import { ForumCategoriesComponent } from './features/forum/pages/forum-categories/forum-categories.component';
import { ForumPostsComponent } from './features/forum/pages/forum-posts/forum-posts.component';

const routes: Routes = [
  { path: '', redirectTo: 'activity-digest', pathMatch: 'full' },
  { path: 'activity-digest',  component: ActivityDigestComponent },
  { path: 'message-users',    component: MessageUsersComponent },
  { path: 'email-history',    component: EmailHistoryComponent },
  { path: 'automatic-emails', component: AutomaticEmailsComponent },
  { path: 'mailing-lists',    component: MailingListsComponent },
  { path: 'forum/dashboard',  component: ForumDashboardComponent },
  { path: 'forum/categories', component: ForumCategoriesComponent },
  { path: 'forum/posts',      component: ForumPostsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}