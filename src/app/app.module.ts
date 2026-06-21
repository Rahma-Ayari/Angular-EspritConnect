import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoleRedirectComponent } from './role-redirect.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSuccessComponent } from './register/register-success.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedLayoutModule } from './shared/shared-layout.module';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule, GoogleSigninButtonModule, SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';

import { ActivityDigestModule } from './features/activity-digest/activity-digest.module';
import { AutomaticEmailsModule } from './features/automatic-emails/automatic-emails.module';
import { EmailHistoryModule } from './features/email-history/email-history.module';
import { MailingListsModule } from './features/mailing-lists/mailing-lists.module';
import { MessageUsersModule } from './features/message-users/message-users.module';
import { ForumModule } from './features/forum/forum.module';
import { ForumClientModule } from './features/forum-client/forum-client.module';
import { LayoutModule } from './shared/layout/layout.module';
import { AdminModule } from './admin/admin.module';

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
import { HomepageComponent } from './homepage/homepage.component';
import { CaptchaComponent } from './shared/captcha/captcha.component';

@NgModule({
  declarations: [
    AppComponent,
    RoleRedirectComponent,
    LoginComponent,
    DashboardComponent,
    RegisterComponent,
    RegisterSuccessComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ProfileComponent,
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
    ModerationQueueComponent,
    HomepageComponent,
    CaptchaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedLayoutModule,
    ActivityDigestModule,
    AutomaticEmailsModule,
    EmailHistoryModule,
    MailingListsModule,
    MessageUsersModule,
    ForumModule,
    ForumClientModule,
    LayoutModule,
    AdminModule,
    SocialLoginModule,
    GoogleSigninButtonModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('483287701118-an9qar20q70rg13s8firlpmu6jg4kpnf.apps.googleusercontent.com')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
