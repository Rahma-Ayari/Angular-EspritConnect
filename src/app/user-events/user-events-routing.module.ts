import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEventDetailsComponent } from './components/user-event-details/user-event-details.component';
import { UserEventsPageComponent } from './components/user-events-page/user-events-page.component';

const routes: Routes = [
  {
    path: '',
    component: UserEventsPageComponent
  },
  {
    path: ':id',
    component: UserEventDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserEventsRoutingModule { }
