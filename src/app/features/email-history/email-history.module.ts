import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EmailHistoryComponent } from './pages/email-history/email-history.component';



@NgModule({
  declarations: [
    EmailHistoryComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule    
  ]
})
export class EmailHistoryModule { }
