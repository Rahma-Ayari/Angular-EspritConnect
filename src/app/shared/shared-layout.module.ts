import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent
  ]
})
export class SharedLayoutModule { }
