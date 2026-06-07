import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

// Modules (Features)
import { ActivityDigestModule } from './features/activity-digest/activity-digest.module';
import { AutomaticEmailsModule } from './features/automatic-emails/automatic-emails.module';
import { EmailHistoryModule } from './features/email-history/email-history.module';
import { MailingListsModule } from './features/mailing-lists/mailing-lists.module';
import { MessageUsersModule } from './features/message-users/message-users.module';
import { ForumModule } from './features/forum/forum.module';
import { ForumClientModule } from './features/forum-client/forum-client.module';
import { LayoutModule } from './shared/layout/layout.module';

// Composants (Support & Backoffice)
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
import { AIChatbotComponent } from './frontoffice/support/ai-chatbot.component';
import { ReportContentComponent } from './frontoffice/support/report-content.component';
import { ModerationQueueComponent } from './backoffice/intelligence/moderation-queue.component';

export function initializeApp(authService: AuthService) {
  return () => new Promise<void>((resolve) => {
    authService.loginAsCurrentRole().subscribe({
      next: () => resolve(),
      error: () => resolve()
    });
  });
}

@NgModule({
  declarations: [
    AppComponent,
    BadgeListComponent,
    BadgeFormComponent,
    UserBadgesComponent,
    SupportDashboardComponent,
    TicketCreateComponent,
    TicketChatComponent,
    AdminTicketDashboardComponent,
    AdminTicketDetailComponent,
    CategoryManagementComponent,
    FaqManagementComponent,
    FaqKnowledgeBaseComponent,
    AIChatbotComponent,
    ReportContentComponent,
    ModerationQueueComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ActivityDigestModule,
    AutomaticEmailsModule,
    EmailHistoryModule,
    MailingListsModule,
    MessageUsersModule,
    ForumModule,
    ForumClientModule,
    LayoutModule
  ],
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }