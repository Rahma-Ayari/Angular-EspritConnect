import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserEventsRoutingModule } from './user-events-routing.module';
import { UserEventDetailsComponent } from './components/user-event-details/user-event-details.component';
import { UserEventsPageComponent } from './components/user-events-page/user-events-page.component';

@NgModule({
  declarations: [
    UserEventsPageComponent,
    UserEventDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UserEventsRoutingModule
  ]
})
export class UserEventsModule { }
