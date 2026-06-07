import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';          
import { HttpClientModule } from '@angular/common/http';
import { MessageUsersComponent } from './pages/message-users/message-users.component';



@NgModule({
  declarations: [
    MessageUsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,       
    HttpClientModule
  ]
})
export class MessageUsersModule { }
