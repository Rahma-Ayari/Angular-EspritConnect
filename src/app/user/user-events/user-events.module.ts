import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserEventsRoutingModule } from './user-events-routing.module';

import { UserEventDetailsComponent } from './components/user-event-details/user-event-details.component';
import { UserEventsPageComponent } from './components/user-events-page/user-events-page.component';
import { UserEventCardComponent } from './components/user-event-card/user-event-card.component';

import { EventsHomeComponent } from './pages/events-home/events-home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyParticipationsComponent } from './pages/my-participations/my-participations.component';
import { BackendUrlPipe } from '../../shared/pipes/backend-url.pipe';

@NgModule({
  declarations: [
    UserEventsPageComponent,
    UserEventDetailsComponent,
    UserEventCardComponent,
    EventsHomeComponent,
    EventDetailsComponent,
    MyParticipationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserEventsRoutingModule,
    BackendUrlPipe
  ]
})
export class UserEventsModule { }
