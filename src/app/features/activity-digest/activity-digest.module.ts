import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ActivityDigestComponent } from './pages/activity-digest/activity-digest.component';
import { DigestPreviewComponent } from './components/digest-preview/digest-preview.component';

@NgModule({
  declarations: [
    ActivityDigestComponent,
    DigestPreviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    ActivityDigestComponent
  ]
})
export class ActivityDigestModule { }