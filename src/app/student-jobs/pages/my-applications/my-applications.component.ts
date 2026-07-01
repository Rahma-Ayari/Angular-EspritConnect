import { Component, OnInit } from '@angular/core';
import { ApplicationsService } from '../../services/applications.service';
import { JobApplication } from '../../models/student-job.model';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  view: 'table' | 'kanban' = 'table';
  loading = true;

  constructor(private applicationsService: ApplicationsService) {}

  ngOnInit(): void {
    this.applicationsService.getMyApplications().subscribe({
      next: (list) => {
        this.applications = list;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
