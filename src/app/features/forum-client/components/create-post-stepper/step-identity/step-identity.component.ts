import { Component, EventEmitter, Output } from '@angular/core';
import { CreatePostStateService } from '../../../services/create-post-state.service';

@Component({
  selector: 'app-step-identity',
  templateUrl: './step-identity.component.html',
  styleUrls: ['./step-identity.component.css']
})
export class StepIdentityComponent {
  @Output() next = new EventEmitter<void>();

  constructor(public readonly state: CreatePostStateService) {}

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.state.patch({ coverImageFile: file });
  }

  canContinue(): boolean {
    const d = this.state.value;
    return !!d.title.trim() && !!d.content.trim();
  }
}

