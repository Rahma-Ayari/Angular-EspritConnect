import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EntrepriseOption, Event as EventModel, EventStatus, EventType } from '../../models/event.model';
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
  isUploading = false;
  uploadProgress = 0;
  error: string | null = null;
  imagePreview: string | null = null;
  entreprises: EntrepriseOption[] = [];
  eventTypes: EventType[] = [];

  readonly statuses: EventStatus[] = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

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

    this.eventForm.get('unlimitedParticipants')?.valueChanges.subscribe((unlimited) => {
      const capacity = this.eventForm.get('capacite');
      if (unlimited) {
        capacity?.clearValidators();
        capacity?.setValue(null);
      } else {
        capacity?.setValidators([Validators.required, Validators.min(1)]);
      }
      capacity?.updateValueAndValidity();
    });

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
        this.error = err?.error?.error || 'Unable to save this event. Check required fields and try again.';
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

  onImageSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      this.error = 'Please select a JPG, PNG, WEBP, or GIF image.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image size must be less than 5MB.';
      input.value = '';
      return;
    }

    this.imagePreview = URL.createObjectURL(file);
    this.isUploading = true;
    this.uploadProgress = 0;
    this.error = null;

    this.eventService.uploadEventImage(file).subscribe({
      next: (uploadEvent) => {
        if (uploadEvent.type === HttpEventType.UploadProgress && uploadEvent.total) {
          this.uploadProgress = Math.round((uploadEvent.loaded / uploadEvent.total) * 100);
        }
        if (uploadEvent.type === HttpEventType.Response) {
          this.eventForm.patchValue({ imageUrl: uploadEvent.body?.imageUrl || null });
          this.isUploading = false;
        }
      },
      error: (err) => {
        console.error('Failed to upload image:', err);
        this.error = err?.error?.error || 'Unable to upload image.';
        this.isUploading = false;
      }
    });
  }

  private buildForm(): void {
    this.eventForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(120)]],
      lieu: ['', [Validators.required, Validators.maxLength(160)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      unlimitedParticipants: [false],
      capacite: [1, [Validators.required, Validators.min(1)]],
      typeEvenementId: [null, Validators.required],
      imageUrl: [''],
      status: ['UPCOMING', Validators.required],
      entrepriseId: [null]
    }, { validators: this.dateRangeValidator });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.error = null;

    const sources = {
      entreprises: this.eventService.getEntreprises().pipe(catchError(() => of([] as EntrepriseOption[]))),
      eventTypes: this.eventService.getEventTypes(true)
    };

    if (this.isEdit && this.eventId) {
      forkJoin({ ...sources, event: this.eventService.getEventById(this.eventId) }).subscribe({
        next: ({ entreprises, eventTypes, event }) => {
          this.entreprises = entreprises;
          this.eventTypes = eventTypes;
          this.patchEvent(event);
          this.isLoading = false;
        },
        error: (err) => this.handleLoadError(err)
      });
      return;
    }

    forkJoin(sources).subscribe({
      next: ({ entreprises, eventTypes }) => {
        this.entreprises = entreprises;
        this.eventTypes = eventTypes;
        this.isLoading = false;
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private patchEvent(event: EventModel): void {
    this.eventForm.patchValue({
      titre: event.titre,
      lieu: event.lieu,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      heureDebut: event.heureDebut,
      heureFin: event.heureFin,
      unlimitedParticipants: event.unlimitedParticipants,
      capacite: event.capacite,
      typeEvenementId: event.typeEvenementId,
      imageUrl: event.imageUrl || '',
      status: event.status || 'UPCOMING',
      entrepriseId: event.entrepriseId || null
    });
    this.imagePreview = event.imageUrl || null;
  }

  private buildPayload(): EventModel {
    const raw = this.eventForm.getRawValue();

    return {
      titre: raw.titre,
      lieu: raw.lieu,
      dateDebut: raw.dateDebut,
      dateFin: raw.dateFin,
      heureDebut: raw.heureDebut,
      heureFin: raw.heureFin,
      unlimitedParticipants: !!raw.unlimitedParticipants,
      capacite: raw.unlimitedParticipants ? null : Number(raw.capacite),
      typeEvenementId: Number(raw.typeEvenementId),
      imageUrl: raw.imageUrl || null,
      status: raw.status,
      entrepriseId: raw.entrepriseId ? Number(raw.entrepriseId) : null
    };
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('dateDebut')?.value;
    const endDate = control.get('dateFin')?.value;
    const startTime = control.get('heureDebut')?.value;
    const endTime = control.get('heureFin')?.value;

    if (!startDate || !endDate || !startTime || !endTime) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    return end > start ? null : { invalidEventRange: true };
  }

  private handleLoadError(err: unknown): void {
    console.error('Failed to load event form data:', err);
    this.error = 'Unable to load event form data. Check event type API and backend URL.';
    this.isLoading = false;
  }
}
