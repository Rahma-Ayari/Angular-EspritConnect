import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobOffer } from '../../../jobs/models/job.model';

@Component({
  selector: 'app-cover-letter-generator',
  templateUrl: './cover-letter-generator.component.html',
  styleUrls: ['./cover-letter-generator.component.css']
})
export class CoverLetterGeneratorComponent {
  @Input() jobs: JobOffer[] = [];
  @Input() selectedJobId?: number;
  @Output() selectedJobIdChange = new EventEmitter<number | undefined>();
  @Output() generate = new EventEmitter<void>();
}
