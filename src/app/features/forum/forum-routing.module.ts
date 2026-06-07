import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForumDashboardComponent } from './pages/forum-dashboard/forum-dashboard.component';
import { ForumCategoriesComponent } from './pages/forum-categories/forum-categories.component';
import { ForumPostsComponent } from './pages/forum-posts/forum-posts.component';

const routes: Routes = [
  { path: 'dashboard', component: ForumDashboardComponent },
  { path: 'categories', component: ForumCategoriesComponent },
  { path: 'posts', component: ForumPostsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule { }
