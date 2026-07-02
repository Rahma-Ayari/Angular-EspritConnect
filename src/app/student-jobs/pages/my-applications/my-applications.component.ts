import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApplicationsService } from '../../services/applications.service';
import { SavedJobsService } from '../../services/saved-jobs.service';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import { JobApplication, KanbanCard, KANBAN_COLUMNS } from '../../models/student-job.model';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  kanbanCards: KanbanCard[] = [];
  view: 'table' | 'kanban' = 'kanban';
  loading = true;
  readonly columns = KANBAN_COLUMNS;

  constructor(
    private applicationsService: ApplicationsService,
    private savedJobs: SavedJobsService,
    private browse: StudentJobsBrowseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    const savedIds = this.savedJobs.getSavedIds();
    this.applicationsService.getMyApplications().subscribe({
      next: (list) => {
        this.applications = list;
        if (!savedIds.length) {
          this.kanbanCards = this.toKanban(list, []);
          this.loading = false;
          return;
        }
        forkJoin(savedIds.map((id) => this.browse.getJob(id))).subscribe({
          next: (jobs) => {
            this.kanbanCards = this.toKanban(list, jobs);
            this.loading = false;
          },
          error: () => {
            this.kanbanCards = this.toKanban(list, []);
            this.loading = false;
          }
        });
      },
      error: () => (this.loading = false)
    });
  }

  openJob(offreId: number): void {
    this.router.navigate(['/dashboard/jobs', offreId]);
  }

  private toKanban(apps: JobApplication[], savedJobs: { id?: number; title?: string; companyName?: string }[]): KanbanCard[] {
    const appliedOffreIds = new Set(apps.map((a) => a.offreId));
    const cards: KanbanCard[] = [];

    for (const job of savedJobs) {
      if (!job.id || appliedOffreIds.has(job.id)) continue;
      cards.push({
        id: `saved-${job.id}`,
        offreId: job.id,
        jobTitle: job.title || 'Saved Job',
        companyName: job.companyName || '—',
        dateLabel: 'Saved',
        uiStatus: 'SAVED',
        isSavedOnly: true
      });
    }

    for (const a of apps) {
      cards.push({
        id: `app-${a.id}`,
        offreId: a.offreId,
        jobTitle: a.jobTitle || `Job #${a.offreId}`,
        companyName: a.companyName || '—',
        dateLabel: a.dateCandidature,
        uiStatus: a.uiStatus,
        isSavedOnly: false
      });
    }
    return cards;
  }
}
