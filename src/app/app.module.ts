import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ActivityDigestModule } from './features/activity-digest/activity-digest.module';
import { AutomaticEmailsModule } from './features/automatic-emails/automatic-emails.module'; // ← AJOUTER
import { EmailHistoryModule } from './features/email-history/email-history.module';           // ← AJOUTER
import { MailingListsModule } from './features/mailing-lists/mailing-lists.module';           // ← AJOUTER
import { MessageUsersModule } from './features/message-users/message-users.module';           // ← AJOUTER
import { ForumModule } from './features/forum/forum.module';
import { LayoutModule } from './shared/layout/layout.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ActivityDigestModule,
    AutomaticEmailsModule,  // ← AJOUTER
    EmailHistoryModule,     // ← AJOUTER
    MailingListsModule,     // ← AJOUTER
    MessageUsersModule,     // ← AJOUTER
    ForumModule,
    LayoutModule
  ],
  providers: [provideClientHydration()],
  bootstrap: [AppComponent]
})
export class AppModule { }