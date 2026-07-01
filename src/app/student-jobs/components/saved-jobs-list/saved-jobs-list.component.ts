import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobOffer } from '../../../jobs/models/job.model';

@Component({
  selector: 'app-saved-jobs-list',
  templateUrl: './saved-jobs-list.component.html',
  styleUrls: ['./saved-jobs-list.component.css']
})
export class SavedJobsListComponent {
  @Input() jobs: JobOffer[] = [];
  @Output() remove = new EventEmitter<number>();
  @Output() applyLater = new EventEmitter<number>();
}
