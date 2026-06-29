import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { JobsService } from '../../jobs/services/jobs.service';
import { JobFilter, JobOffer, JobStatus } from '../../jobs/models/job.model';
import { StudentJobFilter } from '../models/student-job.model';

@Injectable({ providedIn: 'root' })
export class StudentJobsBrowseService {
  constructor(private jobsService: JobsService) {}

  search(filter: StudentJobFilter): Observable<{ data: JobOffer[]; total: number }> {
    const jobFilter: JobFilter = {
      search: filter.search,
      location: filter.location,
      contractType: filter.contractType,
      status: ['ACTIVE' as JobStatus],
      sortBy: filter.sortBy === 'match' ? 'recent' : (filter.sortBy || 'recent'),
      sortOrder: filter.sortOrder || 'desc',
      page: filter.page || 1,
      limit: filter.limit || 10
    };

    return this.jobsService.getJobs(jobFilter).pipe(
      map((res) => {
        let data = (res.data || []).filter(
          (j) => j.status === 'ACTIVE' && !j.isArchived
        );

        if (filter.workMode?.length) {
          data = data.filter((j) => filter.workMode!.includes(j.workMode));
        }
        if (filter.skills?.length) {
          const wanted = filter.skills.map((s) => s.toLowerCase());
          data = data.filter((j) => {
            const jobSkills = [...(j.requiredSkills || []), ...(j.technologies || [])].map(
              (s) => s.toLowerCase()
            );
            return wanted.some((w) => jobSkills.some((js) => js.includes(w)));
          });
        }
        if (filter.salaryMin != null) {
          data = data.filter(
            (j) => (j.salaryMax ?? j.salaryMin ?? 0) >= filter.salaryMin!
          );
        }
        if (filter.company) {
          const c = filter.company.toLowerCase();
          data = data.filter((j) => (j.companyName || '').toLowerCase().includes(c));
        }
        if (filter.domain) {
          const d = filter.domain.toLowerCase();
          data = data.filter(
            (j) =>
              (j.department || '').toLowerCase().includes(d) ||
              (j.description || '').toLowerCase().includes(d)
          );
        }
        if (filter.experienceLevel?.length) {
          data = data.filter((j) => filter.experienceLevel!.includes(j.experienceLevel));
        }
        if (filter.location) {
          const loc = filter.location.toLowerCase();
          data = data.filter((j) => (j.location || '').toLowerCase().includes(loc));
        }

        return { data, total: data.length };
      })
    );
  }

  getJob(id: number): Observable<JobOffer> {
    return this.jobsService.getJobById(id);
  }
}
