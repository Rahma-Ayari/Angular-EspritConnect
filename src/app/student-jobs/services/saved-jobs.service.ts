import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SavedJobEntry } from '../models/student-job.model';

const STORAGE_KEY = 'esprit_saved_jobs';

@Injectable({ providedIn: 'root' })
export class SavedJobsService {
  private entries$ = new BehaviorSubject<SavedJobEntry[]>(this.load());

  readonly saved$ = this.entries$.asObservable();

  getSavedIds(): number[] {
    return this.entries$.value.map((e) => e.jobId);
  }

  isSaved(jobId: number): boolean {
    return this.entries$.value.some((e) => e.jobId === jobId);
  }

  toggle(jobId: number): boolean {
    const list = [...this.entries$.value];
    const idx = list.findIndex((e) => e.jobId === jobId);
    if (idx >= 0) {
      list.splice(idx, 1);
      this.persist(list);
      return false;
    }
    list.unshift({ jobId, savedAt: new Date().toISOString() });
    this.persist(list);
    return true;
  }

  remove(jobId: number): void {
    this.persist(this.entries$.value.filter((e) => e.jobId !== jobId));
  }

  private persist(list: SavedJobEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    this.entries$.next(list);
  }

  private load(): SavedJobEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
