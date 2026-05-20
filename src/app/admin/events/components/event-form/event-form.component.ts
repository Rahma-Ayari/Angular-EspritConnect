import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EntrepriseOption, Event, EventStatus } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  eventId: number | null = null;
  isEdit = false;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  entreprises: EntrepriseOption[] = [];

  readonly statuses: EventStatus[] = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
  readonly eventTypes = ['Workshop', 'Career Fair', 'Hackathon', 'Conference', 'Networking', 'Training'];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.eventId = idParam ? Number(idParam) : null;
    this.isEdit = !!this.eventId;

    this.loadInitialData();
  }

  submit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSaving = true;
    this.error = null;

    const request$ = this.isEdit && this.eventId
      ? this.eventService.updateEvent(this.eventId, payload)
      : this.eventService.createEvent(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/admin/events']);
      },
      error: (err) => {
        console.error('Failed to save event:', err);
        this.isSaving = false;
        this.error = 'Unable to save this event. Check required fields and try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/events']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.eventForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private buildForm(): void {
    this.eventForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(120)]],
      lieu: ['', [Validators.required, Validators.maxLength(160)]],
      dateEvenement: ['', Validators.required],
      capacite: [1, [Validators.required, Validators.min(1)]],
      type: [''],
      imageUrl: [''],
      status: ['UPCOMING', Validators.required],
      entrepriseId: [null, Validators.required]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.error = null;

    if (this.isEdit && this.eventId) {
      forkJoin({
        entreprises: this.eventService.getEntreprises(),
        event: this.eventService.getEventById(this.eventId)
      }).subscribe({
        next: ({ entreprises, event }) => {
          this.entreprises = entreprises;
          this.patchEvent(event);
          this.isLoading = false;
        },
        error: (err) => this.handleLoadError(err)
      });
      return;
    }

    this.eventService.getEntreprises().subscribe({
      next: (entreprises) => {
        this.entreprises = entreprises;
        this.isLoading = false;
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private patchEvent(event: Event): void {
    this.eventForm.patchValue({
      titre: event.titre,
      lieu: event.lieu,
      dateEvenement: this.toDateTimeLocal(event.dateEvenement),
      capacite: event.capacite,
      type: event.type || '',
      imageUrl: event.imageUrl || '',
      status: event.status || 'UPCOMING',
      entrepriseId: event.entrepriseId
    });
  }

  private buildPayload(): Event {
    const raw = this.eventForm.getRawValue();

    return {
      titre: raw.titre,
      lieu: raw.lieu,
      dateEvenement: new Date(raw.dateEvenement).toISOString(),
      capacite: Number(raw.capacite),
      type: raw.type || null,
      imageUrl: raw.imageUrl || null,
      status: raw.status,
      entrepriseId: Number(raw.entrepriseId)
    };
  }

  private toDateTimeLocal(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  private handleLoadError(err: unknown): void {
    console.error('Failed to load event form data:', err);
    this.error = 'Unable to load event form data.';
    this.isLoading = false;
  }
}
