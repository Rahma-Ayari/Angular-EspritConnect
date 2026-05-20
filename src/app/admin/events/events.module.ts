import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { EventsRoutingModule } from './events-routing.module';

import { EventCalendarComponent } from './components/event-calendar/event-calendar.component';

import { EventCardComponent } from './components/event-card/event-card.component';

import { EventStatsComponent } from './components/event-stats/event-stats.component';

import { EventDetailsComponent } from './components/event-details/event-details.component';
import { EventDashboardComponent } from './components/event-dashboard/event-dashboard.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventListComponent } from './components/event-list/event-list.component';

@NgModule({
  declarations: [
    EventDashboardComponent,
    EventFormComponent,
    EventListComponent,
    EventDetailsComponent,
    EventCalendarComponent,
    EventCardComponent,
    EventStatsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EventsRoutingModule
  ]
})
export class EventsModule {}
