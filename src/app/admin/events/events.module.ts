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
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { EventMapComponent } from './components/event-map/event-map.component';
import { EventWaitingListComponent } from './components/event-waiting-list/event-waiting-list.component';
import { EventSuggestionsComponent } from './components/event-suggestions/event-suggestions.component';

@NgModule({
  declarations: [
    EventDashboardComponent,
    EventFormComponent,
    EventDetailsComponent,
    EventCalendarComponent,
    EventCardComponent,
    EventStatsComponent,
    EventMapComponent,
    EventWaitingListComponent,
    EventSuggestionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EventsRoutingModule,
    TimePickerComponent
  ]
})
export class EventsModule {}
