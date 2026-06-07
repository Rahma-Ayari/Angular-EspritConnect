import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BadgeListComponent } from './backoffice/badge-list/badge-list.component';
import { BadgeFormComponent } from './backoffice/badge-form/badge-form.component';
import { UserBadgesComponent } from './frontoffice/user-badges/user-badges.component';
import { SupportDashboardComponent } from './frontoffice/support/support-dashboard.component';
import { TicketCreateComponent } from './frontoffice/support/ticket-create.component';
import { TicketChatComponent } from './frontoffice/support/ticket-chat.component';
import { AdminTicketDashboardComponent } from './backoffice/support/admin-ticket-dashboard.component';
import { AdminTicketDetailComponent } from './backoffice/support/admin-ticket-detail.component';
import { CategoryManagementComponent } from './backoffice/support/category-management.component';
import { FaqManagementComponent } from './backoffice/support/faq-management.component';
import { FaqKnowledgeBaseComponent } from './frontoffice/support/faq-knowledge-base.component';
import { ReportContentComponent } from './frontoffice/support/report-content.component';
import { ModerationQueueComponent } from './backoffice/intelligence/moderation-queue.component';

// Imports de vos fonctionnalités
import { ActivityDigestComponent } from './features/activity-digest/pages/activity-digest/activity-digest.component';
import { MessageUsersComponent } from './features/message-users/pages/message-users/message-users.component';
import { EmailHistoryComponent } from './features/email-history/pages/email-history/email-history.component';
import { AutomaticEmailsComponent } from './features/automatic-emails/pages/automatic-emails/automatic-emails.component';
import { MailingListsComponent } from './features/mailing-lists/pages/mailing-lists/mailing-lists.component';
import { ForumDashboardComponent } from './features/forum/pages/forum-dashboard/forum-dashboard.component';
import { ForumCategoriesComponent } from './features/forum/pages/forum-categories/forum-categories.component';
import { ForumPostsComponent } from './features/forum/pages/forum-posts/forum-posts.component';
import { ForumHomeComponent } from './features/forum-client/pages/forum-home/forum-home.component';
import { ForumDetailComponent } from './features/forum-client/pages/forum-detail/forum-detail.component';
import { ForumGroupsComponent } from './features/forum-client/pages/forum-groups/forum-groups.component';
import { ForumGroupDetailComponent } from './features/forum-client/pages/forum-group-detail/forum-group-detail.component';
import { ForumGroupsModerationComponent } from './features/forum/pages/forum-groups-moderation/forum-groups-moderation.component';

// Imports Support, Badges et Moderation


const routes: Routes = [
  // Routes Activity & Mailing
  { path: 'activity-digest', component: ActivityDigestComponent },
  { path: 'message-users', component: MessageUsersComponent },
  { path: 'email-history', component: EmailHistoryComponent },
  { path: 'automatic-emails', component: AutomaticEmailsComponent },
  { path: 'mailing-lists', component: MailingListsComponent },
  
  // Routes Forum
  { path: 'forum/dashboard', component: ForumDashboardComponent },
  { path: 'forum/categories', component: ForumCategoriesComponent },
  { path: 'forum/posts', component: ForumPostsComponent },
  { path: 'admin/groups-moderation', component: ForumGroupsModerationComponent },
  { path: 'user/forum', component: ForumHomeComponent },
  { path: 'user/forum/posts/:id', component: ForumDetailComponent },
  { path: 'user/forum/groups', component: ForumGroupsComponent },
  { path: 'user/forum/groups/:id', component: ForumGroupDetailComponent },

  // Routes Badges & Support
  { path: 'admin/badges', component: BadgeListComponent },
  { path: 'admin/badges/create', component: BadgeFormComponent },
  { path: 'admin/badges/edit/:id', component: BadgeFormComponent },
  { path: 'admin/support', component: AdminTicketDashboardComponent },
  { path: 'admin/support/ticket/:id', component: AdminTicketDetailComponent },
  { path: 'admin/support/categories', component: CategoryManagementComponent },
  { path: 'admin/support/faqs', component: FaqManagementComponent },
  { path: 'admin/moderation', component: ModerationQueueComponent },
  { path: 'my-badges', component: UserBadgesComponent },
  { path: 'support', component: SupportDashboardComponent },
  { path: 'support/faq', component: FaqKnowledgeBaseComponent },
  { path: 'support/new', component: TicketCreateComponent },
  { path: 'support/report', component: ReportContentComponent },
  { path: 'support/ticket/:id', component: TicketChatComponent },

  // Redirections
  { path: '', redirectTo: 'activity-digest', pathMatch: 'full' },
  { path: '**', redirectTo: 'activity-digest' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}