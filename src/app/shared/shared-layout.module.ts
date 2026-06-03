import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserSidebarComponent } from './user-sidebar/user-sidebar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    UserHeaderComponent,
    UserSidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    UserHeaderComponent,
    UserSidebarComponent
  ]
})
export class SharedLayoutModule { }
