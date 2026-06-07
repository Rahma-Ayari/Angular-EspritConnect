import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CreatePostStateService } from '../../../services/create-post-state.service';

interface MockStudent {
  id: number;
  name: string;
  email: string;
  role: 'Modérateur' | 'Membre';
  invited: boolean;
}

@Component({
  selector: 'app-step-review',
  templateUrl: './step-review.component.html',
  styleUrls: ['./step-review.component.css']
})
export class StepReviewComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  suggestedStudents: MockStudent[] = [
    { id: 1, name: 'Sonia Ben Ali', email: 'sonia.benali@esprit.tn', role: 'Membre', invited: false },
    { id: 2, name: 'Firas Guesmi', email: 'firas.guesmi@esprit.tn', role: 'Modérateur', invited: false },
    { id: 3, name: 'Yasmine Dridi', email: 'yasmine.dridi@esprit.tn', role: 'Membre', invited: false },
    { id: 4, name: 'Malek Chaabane', email: 'malek.chaabane@esprit.tn', role: 'Membre', invited: false }
  ];

  constructor(public readonly state: CreatePostStateService) {}

  ngOnInit(): void {}

  toggleInvite(student: MockStudent): void {
    student.invited = !student.invited;
  }

  changeRole(student: MockStudent, roleValue: string): void {
    student.role = roleValue as 'Modérateur' | 'Membre';
  }
}

