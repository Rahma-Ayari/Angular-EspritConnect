import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ForumCategory } from '../../models/forum-client.models';
import { CreatePostStateService } from '../../services/create-post-state.service';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-create-post-stepper',
  templateUrl: './create-post-stepper.component.html',
  styleUrls: ['./create-post-stepper.component.css']
})
export class CreatePostStepperComponent {
  @Input() categories: ForumCategory[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  step: Step = 1;

  constructor(public readonly state: CreatePostStateService) {}

  goTo(step: Step): void {
    if (step === 2 && !(this.state.value.title.trim() && this.state.value.content.trim())) return;
    if (step === 3 && !this.state.value.category?.id) return;
    this.step = step;
  }

  next(): void {
    if (this.step === 1) this.goTo(2);
    else if (this.step === 2) this.goTo(3);
  }

  back(): void {
    if (this.step === 2) this.step = 1;
    else if (this.step === 3) this.step = 2;
  }
}

