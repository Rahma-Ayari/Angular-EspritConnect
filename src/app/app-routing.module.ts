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

const routes: Routes = [
  // Backoffice (Admin) routes
  { path: 'admin/badges', component: BadgeListComponent },
  { path: 'admin/badges/create', component: BadgeFormComponent },
  { path: 'admin/badges/edit/:id', component: BadgeFormComponent },
  { path: 'admin/support', component: AdminTicketDashboardComponent },
  { path: 'admin/support/ticket/:id', component: AdminTicketDetailComponent },
  { path: 'admin/support/categories', component: CategoryManagementComponent },
  { path: 'admin/support/faqs', component: FaqManagementComponent },
  { path: 'admin/moderation', component: ModerationQueueComponent },

  // Frontoffice (User) routes
  { path: 'my-badges', component: UserBadgesComponent },
  { path: 'support', component: SupportDashboardComponent },
  { path: 'support/faq', component: FaqKnowledgeBaseComponent },
  { path: 'support/new', component: TicketCreateComponent },
  { path: 'support/report', component: ReportContentComponent },
  { path: 'support/ticket/:id', component: TicketChatComponent },

  // Default redirect
  { path: '', redirectTo: 'admin/badges', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin/badges' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
