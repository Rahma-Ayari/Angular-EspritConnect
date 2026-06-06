import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { JobOffer } from '../jobs/models/job.model';
import { StudentJobsBrowseService } from '../student-jobs/services/student-jobs-browse.service';
import { ApplicationsService, ApplyPayload } from '../student-jobs/services/applications.service';

/** Legacy alias — prefer StudentJobsBrowseService and ApplicationsService. */
@Injectable({ providedIn: 'root' })
export class StudentJobsService {
  constructor(
    private browse: StudentJobsBrowseService,
    private applications: ApplicationsService
  ) {}

  search(filters: {
    domaine?: string;
    localisation?: string;
    typeOffre?: string;
  }): Observable<JobOffer[]> {
    return this.browse
      .search({
        search: filters.domaine,
        location: filters.localisation,
        contractType: filters.typeOffre ? [filters.typeOffre as any] : undefined,
        limit: 50,
        page: 1
      })
      .pipe(map((r) => r.data));
  }

  getOffer(id: number): Observable<JobOffer> {
    return this.browse.getJob(id);
  }

  apply(body: { offreId: number; lettreMotivation?: string }): Observable<unknown> {
    return this.applications.apply(body as ApplyPayload);
  }
}
