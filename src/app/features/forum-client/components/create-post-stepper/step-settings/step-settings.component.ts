import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ForumCategory } from '../../../models/forum-client.models';
import { CreatePostStateService } from '../../../services/create-post-state.service';

@Component({
  selector: 'app-step-settings',
  templateUrl: './step-settings.component.html',
  styleUrls: ['./step-settings.component.css']
})
export class StepSettingsComponent {
  @Input() categories: ForumCategory[] = [];
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  tagInput = '';

  constructor(public readonly state: CreatePostStateService) {}

  setCategory(categoryId: string): void {
    const id = Number(categoryId);
    const cat = this.categories.find((c) => c.id === id) || null;
    this.state.patch({ category: cat });
  }

  addTag(): void {
    const raw = (this.tagInput || '').trim();
    if (!raw) return;
    const cleaned = raw.startsWith('#') ? raw : `#${raw}`;
    const existing = this.state.value.tags.map((t) => t.toLowerCase());
    if (existing.includes(cleaned.toLowerCase())) {
      this.tagInput = '';
      return;
    }
    this.state.patch({ tags: [...this.state.value.tags, cleaned] });
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.state.patch({ tags: this.state.value.tags.filter((t) => t !== tag) });
  }

  canContinue(): boolean {
    return !!this.state.value.category?.id;
  }
}

