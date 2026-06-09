import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventType } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-type-crud',
  templateUrl: './event-type-crud.component.html',
  styleUrls: ['./event-type-crud.component.css']
})
export class EventTypeCrudComponent implements OnInit {
  form!: FormGroup;
  types: EventType[] = [];
  editingId: number | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private eventService: EventService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(120)]],
      description: [''],
      actif: [true]
    });
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading = true;
    this.eventService.getEventTypes(false).subscribe({
      next: (types) => {
        this.types = types;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load event types:', err);
        this.error = 'Unable to load event types.';
        this.loading = false;
      }
    });
  }

  edit(type: EventType): void {
    this.editingId = type.idTypeEvenement || null;
    this.form.patchValue(type);
  }

  reset(): void {
    this.editingId = null;
    this.form.reset({ nom: '', description: '', actif: true });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload = this.form.value;
    const request$ = this.editingId
      ? this.eventService.updateEventType(this.editingId, payload)
      : this.eventService.createEventType(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.reset();
        this.loadTypes();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.error || 'Unable to save event type.';
      }
    });
  }

  delete(type: EventType): void {
    if (!type.idTypeEvenement) return;
    const confirmed = typeof window === 'undefined' || window.confirm(`Delete "${type.nom}"?`);
    if (!confirmed) return;
    this.eventService.deleteEventType(type.idTypeEvenement).subscribe({
      next: () => this.loadTypes(),
      error: (err) => this.error = err?.error?.error || 'Unable to delete event type.'
    });
  }
}
