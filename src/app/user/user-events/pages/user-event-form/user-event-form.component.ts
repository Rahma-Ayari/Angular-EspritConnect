import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Event as EventModel } from '../../../../admin/events/models/event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-user-event-form',
  templateUrl: './user-event-form.component.html',
  styleUrls: ['./user-event-form.component.css']
})
export class UserEventFormComponent implements OnInit {
  form!: FormGroup;
  eventId: number | null = null;
  eventTypes: Array<{ idTypeEvenement: number; nom: string }> = [];
  loading = false;
  saving = false;
  uploading = false;
  imagePreview: string | null = null;
  error: string | null = null;

  sidebarOpen = true;
  activeNav = 'events';

  constructor(
    private fb: FormBuilder,
    private service: UserEventsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      lieu: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      typeEvenementId: [null, Validators.required],
      unlimitedParticipants: [true],
      capacite: [null],
      imageUrl: [''],
      status: ['UPCOMING']
    });

    this.form.get('unlimitedParticipants')?.valueChanges.subscribe((unlimited) => {
      const capacity = this.form.get('capacite');
      if (unlimited) {
        capacity?.clearValidators();
        capacity?.setValue(null);
      } else {
        capacity?.setValidators([Validators.required, Validators.min(1)]);
      }
      capacity?.updateValueAndValidity();
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.eventId = id ? Number(id) : null;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getEventTypes().subscribe({
      next: (types) => {
        this.eventTypes = types;
        if (this.eventId) {
          this.service.getEventById(this.eventId).subscribe({
            next: (event) => {
              this.form.patchValue(event);
              this.imagePreview = event.imageUrl || null;
              this.loading = false;
            },
            error: (err) => this.fail(err)
          });
        } else {
          this.loading = false;
        }
      },
      error: (err) => this.fail(err)
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const payload: EventModel = {
      ...raw,
      typeEvenementId: Number(raw.typeEvenementId),
      capacite: raw.unlimitedParticipants ? null : Number(raw.capacite),
      unlimitedParticipants: !!raw.unlimitedParticipants,
      entrepriseId: null,
      status: 'UPCOMING'
    };

    this.saving = true;
    const request$ = this.eventId ? this.service.updateEvent(this.eventId, payload) : this.service.createEvent(payload);
    request$.subscribe({
      next: () => this.router.navigate(['/events/mine']),
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.error || 'Unable to save event.';
      }
    });
  }

  onImageSelected(event: globalThis.Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imagePreview = URL.createObjectURL(file);
    this.uploading = true;
    this.service.uploadEventImage(file).subscribe({
      next: (uploadEvent) => {
        if (uploadEvent.type === HttpEventType.Response) {
          this.form.patchValue({ imageUrl: uploadEvent.body?.imageUrl || null });
          this.uploading = false;
        }
      },
      error: (err) => {
        this.uploading = false;
        this.error = err?.error?.error || 'Unable to upload image.';
      }
    });
  }

  private fail(err: unknown): void {
    console.error('Failed to load event form:', err);
    this.error = 'Unable to load event form data.';
    this.loading = false;
  }

  setNav(navId: string): void {
    this.activeNav = navId;
    const routes: { [key: string]: string } = {
      dashboard: '/dashboard',
      profile: '/profile',
      opportunities: '/opportunities',
      events: '/events',
      messages: '/messages',
      settings: '/settings'
    };
    if (routes[navId]) {
      this.router.navigate([routes[navId]]);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}