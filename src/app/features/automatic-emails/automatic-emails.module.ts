import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AutomaticEmailsComponent } from './pages/automatic-emails/automatic-emails.component';

@NgModule({
  declarations: [AutomaticEmailsComponent],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class AutomaticEmailsModule { }