import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ForumCategory } from '../models/forum-client.models';

export interface CreatePostDraft {
  // Step 1
  title: string;
  content: string;
  website?: string;
  coverImageFile?: File | null;

  // Step 2
  category?: ForumCategory | null;
  tags: string[];
  allowMentions: boolean;
}

const EMPTY_DRAFT: CreatePostDraft = {
  title: '',
  content: '',
  website: '',
  coverImageFile: null,
  category: null,
  tags: [],
  allowMentions: true
};

@Injectable({ providedIn: 'root' })
export class CreatePostStateService {
  private readonly draft$ = new BehaviorSubject<CreatePostDraft>({ ...EMPTY_DRAFT });

  readonly value$ = this.draft$.asObservable();

  get value(): CreatePostDraft {
    return this.draft$.value;
  }

  patch(partial: Partial<CreatePostDraft>): void {
    this.draft$.next({ ...this.draft$.value, ...partial });
  }

  reset(): void {
    this.draft$.next({ ...EMPTY_DRAFT });
  }
}

