import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEventDetailsComponent } from './components/user-event-details/user-event-details.component';
import { UserEventsPageComponent } from './components/user-events-page/user-events-page.component';
import { EventsHomeComponent } from './pages/events-home/events-home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { MyParticipationsComponent } from './pages/my-participations/my-participations.component';
import { MyCreatedEventsComponent } from './pages/my-created-events/my-created-events.component';
import { MyEventDetailsComponent } from './pages/my-event-details/my-event-details.component';
import { UserEventFormComponent } from './pages/user-event-form/user-event-form.component';

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
    path: 'mine',
    component: MyCreatedEventsComponent
  },
  {
    path: 'my-events/:id',
    component: MyEventDetailsComponent
  },
  {
    path: 'create',
    component: UserEventFormComponent
  },
  {
    path: 'edit/:id',
    component: UserEventFormComponent
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
