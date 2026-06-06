import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserEventsRoutingModule } from './user-events-routing.module';
import { SharedLayoutModule } from '../../shared/shared-layout.module';

import { UserEventDetailsComponent } from './components/user-event-details/user-event-details.component';
import { UserEventsPageComponent } from './components/user-events-page/user-events-page.component';
import { UserEventCardComponent } from './components/user-event-card/user-event-card.component';

import { EventsHomeComponent } from './pages/events-home/events-home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { MyParticipationsComponent } from './pages/my-participations/my-participations.component';

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
    SharedLayoutModule
  ]
})
export class UserEventsModule { }
