import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {

  eventForm!: FormGroup;

  eventId!: number;

  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.eventForm = this.fb.group({

      titre: ['', Validators.required],

      lieu: ['', Validators.required],

      dateEvenement: ['', Validators.required],

      capacite: ['', Validators.required],

      type: [''],

      imageUrl: [''],

      status: ['ACTIVE'],

      entrepriseId: [1]
    });

    this.route.params.subscribe(params => {

      if(params['id']) {

        this.isEdit = true;

        this.eventId = +params['id'];

        this.loadEvent();
      }
    });
  }

  loadEvent(): void {

    this.eventService.getEventById(this.eventId)
      .subscribe(event => {

        this.eventForm.patchValue(event);
      });
  }

  submit(): void {

    if(this.eventForm.invalid) return;

    if(this.isEdit) {

      this.eventService.updateEvent(
        this.eventId,
        this.eventForm.value
      ).subscribe(() => {

        this.router.navigate(['/admin/events']);
      });

    } else {

      this.eventService.createEvent(
        this.eventForm.value
      ).subscribe(() => {

        this.router.navigate(['/admin/events']);
      });
    }
  }
}
