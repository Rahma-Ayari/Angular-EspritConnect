import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MailingListsComponent } from './pages/mailing-lists/mailing-lists.component';

@NgModule({
  declarations: [MailingListsComponent],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class MailingListsModule { }