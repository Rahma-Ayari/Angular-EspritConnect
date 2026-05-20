import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EventDashboardComponent } from './components/event-dashboard/event-dashboard.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';

const routes: Routes = [
  {
    path: '',
    component: EventDashboardComponent
  },
  {
    path: 'create',
    component: EventFormComponent
  },
  {
    path: 'edit/:id',
    component: EventFormComponent
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
export class EventsRoutingModule {}
