import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EventsHomeComponent } from './pages/events-home/events-home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { MyParticipationsComponent } from './pages/my-participations/my-participations.component';

const routes: Routes = [
  {
    path: '',
    component: EventsHomeComponent
  },
  {
    path: 'participations',
    component: MyParticipationsComponent
  },
  {
    path: ':id',
    component: EventDetailsComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserEventsRoutingModule { }