import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EntrepriseOption, Event as EventModel, EventType } from '../../models/event.model';
import { EventService } from '../../services/event.service';

interface LocationPayload {
  latitude: number;
  longitude: number;
  address: string;
}

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  @Input() modalMode = true;
  @Input() eventId: number | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  eventForm!: FormGroup;
  isEdit = false;
  isLoading = false;
  isSaving = false;
  isUploading = false;
  uploadProgress = 0;
  error: string | null = null;
  success: string | null = null;
  imagePreview: string | null = null;
  companies: EntrepriseOption[] = [];
  eventTypes: EventType[] = [];
  showTypeCreator = false;
  typeCreatorForm!: FormGroup;
  isCreatingType = false;
  typeError: string | null = null;
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.buildTypeCreatorForm();
    this.isEdit = this.eventId !== null;

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

    this.eventForm.get('online')?.valueChanges.subscribe((online) => {
      const lieu = this.eventForm.get('lieu');
      if (online) {
        lieu?.clearValidators();
        lieu?.setValue('');
      } else {
        lieu?.setValidators([Validators.required, Validators.maxLength(160)]);
      }
      lieu?.updateValueAndValidity();
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
    this.success = null;

    const request$ = this.isEdit && this.eventId
      ? this.eventService.updateEvent(this.eventId, payload)
      : this.eventService.createEvent(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.success = this.isEdit ? 'Event updated successfully.' : 'Event created successfully.';
        this.saved.emit();
        if (this.modalMode) {
          setTimeout(() => this.cancel(), 1500);
        }
      },
      error: (err) => {
        console.error('Failed to save event:', err);
        this.isSaving = false;
        this.error = err?.error?.error || 'Unable to save this event. Check required fields and try again.';
      }
    });
  }

  cancel(): void {
    this.closed.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.eventForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getTimeValue(controlName: string): string {
    return this.eventForm.get(controlName)?.value || '';
  }

  setTimeValue(controlName: string, value: string): void {
    this.eventForm.get(controlName)?.setValue(value);
  }

  toggleTypeCreator(): void {
    this.showTypeCreator = !this.showTypeCreator;
    if (this.showTypeCreator) {
      this.typeCreatorForm.reset({ title: '', description: '' });
      this.typeError = null;
    }
  }

  onLocationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) {
      this.latitude = null;
      this.longitude = null;
      return;
    }
    this.debouncedGeocode(value);
  }

  private geocodeTimeout: any = null;
  private debouncedGeocode(address: string): void {
    if (this.geocodeTimeout) clearTimeout(this.geocodeTimeout);
    this.geocodeTimeout = setTimeout(() => this.geocode(address), 800);
  }

  private geocode(address: string): void {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
      headers: { 'User-Agent': 'EspritConnect-Events/1.0' }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        if (!data || data.length === 0) return;
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name || address;
        this.latitude = lat;
        this.longitude = lon;
        this.eventForm.get('lieu')?.setValue(displayName);
      })
      .catch(() => {});
  }

  onMapLocationSelected(payload: LocationPayload): void {
    this.latitude = payload.latitude;
    this.longitude = payload.longitude;
    if (payload.address) {
      this.eventForm.get('lieu')?.setValue(payload.address);
    }
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

  createType(): void {
    const title = this.typeCreatorForm.get('title')?.value?.trim();
    if (!title) {
      this.typeError = 'Type title is required.';
      return;
    }

    this.isCreatingType = true;
    this.typeError = null;

    const payload: EventType = {
      nom: title,
      description: (this.typeCreatorForm.get('description')?.value || '').trim() || null,
      actif: true
    };

    this.eventService.createEventType(payload).subscribe({
      next: (type) => {
        this.isCreatingType = false;
        this.eventTypes = [...this.eventTypes, type];
        this.eventForm.patchValue({ typeEvenementId: type.idTypeEvenement || null });
        this.toggleTypeCreator();
      },
      error: (err) => {
        console.error('Failed to create event type:', err);
        this.isCreatingType = false;
        this.typeError = err?.error?.error || 'Unable to create event type.';
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
      online: [false],
      unlimitedParticipants: [false],
      capacite: [1, [Validators.required, Validators.min(1)]],
      typeEvenementId: [null, Validators.required],
      imageUrl: [''],
      entrepriseId: [null]
    }, { validators: this.dateRangeValidator });
  }

  private buildTypeCreatorForm(): void {
    this.typeCreatorForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(80)]],
      description: ['']
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.error = null;

    const sources = {
      companies: this.eventService.getEntreprises().pipe(catchError(() => of([] as EntrepriseOption[]))),
      eventTypes: this.eventService.getEventTypes(true)
    };

    if (this.isEdit && this.eventId) {
      forkJoin({ ...sources, event: this.eventService.getEventById(this.eventId) }).subscribe({
        next: ({ companies, eventTypes, event }) => {
          this.companies = companies;
          this.eventTypes = eventTypes;
          this.patchEvent(event);
          this.isLoading = false;
        },
        error: (err) => this.handleLoadError(err)
      });
      return;
    }

    forkJoin(sources).subscribe({
      next: ({ companies, eventTypes }) => {
        this.companies = companies;
        this.eventTypes = eventTypes;
        this.isLoading = false;
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private patchEvent(event: EventModel): void {
    this.eventForm.patchValue({
      titre: event.titre,
      lieu: event.lieu || '',
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      heureDebut: event.heureDebut,
      heureFin: event.heureFin,
      online: event.online ?? !event.lieu,
      unlimitedParticipants: event.unlimitedParticipants,
      capacite: event.capacite,
      typeEvenementId: event.typeEvenementId,
      imageUrl: event.imageUrl || '',
      entrepriseId: event.entrepriseId || null
    });
    this.imagePreview = event.imageUrl || null;
    this.latitude = event.latitude ?? null;
    this.longitude = event.longitude ?? null;
  }

  private buildPayload(): EventModel {
    const raw = this.eventForm.getRawValue();
    const online = !!raw.online;

    return {
      titre: raw.titre,
      lieu: online ? '' : raw.lieu,
      dateDebut: raw.dateDebut,
      dateFin: raw.dateFin,
      heureDebut: raw.heureDebut,
      heureFin: raw.heureFin,
      online,
      unlimitedParticipants: !!raw.unlimitedParticipants,
      capacite: raw.unlimitedParticipants ? null : Number(raw.capacite),
      typeEvenementId: Number(raw.typeEvenementId),
      imageUrl: raw.imageUrl || null,
      entrepriseId: raw.entrepriseId ? Number(raw.entrepriseId) : null,
      latitude: this.latitude,
      longitude: this.longitude
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
