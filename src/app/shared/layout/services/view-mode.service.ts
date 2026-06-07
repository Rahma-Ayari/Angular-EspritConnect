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

  /** Map backend role to front-office view mode (admin preview keeps current mode). */
  syncFromRole(role: string | null | undefined): void {
    switch (role) {
      case 'ETUDIANT':
        this.setMode('student');
        break;
      case 'ALUMNI':
        this.setMode('alumni');
        break;
      case 'ADMIN':
        break;
      default:
        this.setMode('student');
        break;
    }
  }
}

