import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppViewMode = 'admin' | 'student' | 'alumni';

@Injectable({ providedIn: 'root' })
export class ViewModeService {
  private readonly mode$ = new BehaviorSubject<AppViewMode>('admin');

  readonly currentMode$ = this.mode$.asObservable();

  getCurrentMode(): AppViewMode {
    return this.mode$.value;
  }

  setMode(mode: AppViewMode): void {
    this.mode$.next(mode);
  }
}

