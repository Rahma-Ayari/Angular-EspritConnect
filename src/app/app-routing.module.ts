import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSuccessComponent } from './register/register-success.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard, AdminGuard, EntrepriseGuard, StudentGuard, RoleHomeRedirectGuard, FallbackRedirectGuard } from './guards/auth.guard';

import { AdminLayoutComponent } from './shared/layout/admin-layout/admin-layout.component';

import { DashboardComponent as AdminDashboardComponent } from './admin/pages/dashboard/dashboard.component';
import { UserApprovalsComponent } from './admin/pages/user-management/user-approvals/user-approvals.component';
import { EnterpriseVerificationComponent } from './admin/pages/enterprise-verification/enterprise-verification.component';
import { AdminGeneralSettingsComponent } from './admin-general-settings/admin-general-settings.component';
import { AdminRegionalSettingsComponent } from './admin-regional-settings/admin-regional-settings.component';
import { AdminRegistrationSettingsComponent } from './admin-registration-settings/admin-registration-settings.component';
import { AdminHomepageSettingsComponent } from './admin/pages/settings/admin-homepage-settings.component';
import { JobsSettingsComponent } from './admin/pages/jobs/jobs-settings.component';
import { JobsImportComponent } from './admin/pages/jobs/jobs-import.component';

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
import { ProfileComponent } from './profile/profile.component';
import { RoleRedirectComponent } from './role-redirect.component';

const adminShellRoutes: Routes = [
  // Job & user management (from job branch)
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin/settings/general', component: AdminGeneralSettingsComponent, canActivate: [AdminGuard] },
  { path: 'admin/settings/regional', component: AdminRegionalSettingsComponent, canActivate: [AdminGuard] },
  { path: 'admin/settings/registration', component: AdminRegistrationSettingsComponent, canActivate: [AdminGuard] },
  { path: 'admin/settings/homepage', component: AdminHomepageSettingsComponent, canActivate: [AdminGuard] },
  { path: 'admin/user-management/approval', component: UserApprovalsComponent, canActivate: [AdminGuard] },
  { path: 'admin/user-management/enterprise-verification', component: EnterpriseVerificationComponent, canActivate: [AdminGuard] },
  { path: 'admin/jobs', redirectTo: 'admin/jobs/settings', pathMatch: 'full' },
  { path: 'admin/jobs/settings', component: JobsSettingsComponent, canActivate: [AdminGuard] },
  { path: 'admin/jobs/import', component: JobsImportComponent, canActivate: [AdminGuard] },

  // Email communications (from develop)
  { path: 'activity-digest', component: ActivityDigestComponent, canActivate: [AdminGuard] },
  { path: 'message-users', component: MessageUsersComponent, canActivate: [AdminGuard] },
  { path: 'email-history', component: EmailHistoryComponent, canActivate: [AdminGuard] },
  { path: 'automatic-emails', component: AutomaticEmailsComponent, canActivate: [AdminGuard] },
  { path: 'mailing-lists', component: MailingListsComponent, canActivate: [AdminGuard] },

  // Forum (from develop)
  { path: 'forum/dashboard', component: ForumDashboardComponent, canActivate: [AdminGuard] },
  { path: 'forum/categories', component: ForumCategoriesComponent, canActivate: [AdminGuard] },
  { path: 'forum/posts', component: ForumPostsComponent, canActivate: [AdminGuard] },
  { path: 'admin/groups-moderation', component: ForumGroupsModerationComponent, canActivate: [AdminGuard] },
  { path: 'user/forum', component: ForumHomeComponent },
  { path: 'user/forum/posts/:id', component: ForumDetailComponent },
  { path: 'user/forum/groups', component: ForumGroupsComponent },
  { path: 'user/forum/groups/:id', component: ForumGroupDetailComponent },

  // Badges & support (from develop)
  { path: 'admin/badges', component: BadgeListComponent, canActivate: [AdminGuard] },
  { path: 'admin/badges/create', component: BadgeFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/badges/edit/:id', component: BadgeFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/support', component: AdminTicketDashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin/support/ticket/:id', component: AdminTicketDetailComponent, canActivate: [AdminGuard] },
  { path: 'admin/support/categories', component: CategoryManagementComponent, canActivate: [AdminGuard] },
  { path: 'admin/support/faqs', component: FaqManagementComponent, canActivate: [AdminGuard] },
  { path: 'admin/moderation', component: ModerationQueueComponent, canActivate: [AdminGuard] },
  { path: 'my-badges', component: UserBadgesComponent },
  { path: 'support', component: SupportDashboardComponent },
  { path: 'support/faq', component: FaqKnowledgeBaseComponent },
  { path: 'support/new', component: TicketCreateComponent },
  { path: 'support/report', component: ReportContentComponent },
  { path: 'support/ticket/:id', component: TicketChatComponent },

  // Student dashboard & profile (same unified sidebar)
  { path: 'dashboard', component: DashboardComponent, canActivate: [StudentGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [StudentGuard] },

  // Student jobs (same shell as forum, badges, support)
  {
    path: 'dashboard/jobs',
    loadChildren: () =>
      import('./student-jobs/student-jobs.module').then((m) => m.StudentJobsModule),
    canActivate: [StudentGuard]
  },
  { path: 'opportunities', redirectTo: 'dashboard/jobs/discover', pathMatch: 'full' },

  { path: '', canActivate: [RoleHomeRedirectGuard], pathMatch: 'full', component: RoleRedirectComponent },
];

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-success', component: RegisterSuccessComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'entreprise',
    loadChildren: () => import('./entreprise/entreprise.module').then((m) => m.EntrepriseModule),
    canActivate: [AuthGuard, EntrepriseGuard]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: adminShellRoutes
  },
  { path: '**', canActivate: [FallbackRedirectGuard], component: RoleRedirectComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
