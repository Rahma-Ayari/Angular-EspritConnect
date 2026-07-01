import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, EventStats } from '../../models/event.model';
import { ArchiveEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.css']
})
export class EventDashboardComponent implements OnInit {
  events: Event[] = [];
  eventsList: Event[] = [];
  archivedEvents: ArchiveEvent[] = [];
  stats: EventStats | null = null;
  isLoading = false;
  isEventsListLoading = false;
  error: string | null = null;
  showArchiveModal = false;
  archiveLoading = false;
  archiveError: string | null = null;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  searchQuery = '';
  selectedStatus = '';
  selectedType = '';
  eventTypes: string[] = [];
  formModalOpen = false;
  formEditingEvent: Event | null = null;
  selectedEvent: Event | null = null;
  eventsListModalOpen = false;

  readonly statuses = ['ACTIVE', 'UPCOMING', 'CANCELLED', 'COMPLETED'];

  eventsListPage = 0;
  eventsListPageSize = 1000;
  eventsListTotal = 0;
  eventsListTotalPages = 0;

  page = 0;
  pageSize = 4;
  totalElements = 0;
  totalPages = 0;

  showDeleteModal = false;
  deleteTargetEvent: Event | null = null;
  deleteEmailSubject = 'Event Cancellation Notice';
  deleteEmailContent = '';
  emailSending = false;
  emailSent = false;
  emailError: string | null = null;
  emailSentSuccess = false;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadEvents();
    this.loadStats();
    this.loadEventTypes();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    this.eventService.getAllEventsPaged(
      { search: this.searchQuery, status: this.selectedStatus, type: this.selectedType },
      this.page,
      this.pageSize
    ).subscribe({
      next: (page) => {
        this.events = this.selectedStatus === 'COMPLETED'
          ? page.content
          : page.content.filter(event => event.status !== 'COMPLETED');
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = 'Unable to load events.';
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadEvents();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadEvents();
    }
  }

  loadStats(): void {
    this.eventService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Failed to load event stats:', err);
      }
    });
  }

  loadEventTypes(): void {
    this.eventService.getEventTypes(true).subscribe({
      next: (types) => {
        this.eventTypes = types.map(type => type.nom);
      },
      error: (err) => console.error('Failed to load event types:', err)
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.loadEvents();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  openCreateEvent(): void {
    this.formEditingEvent = null;
    this.formModalOpen = true;
  }

  openEditEvent(event: Event): void {
    this.selectedEvent = null;
    this.formEditingEvent = event;
    this.formModalOpen = true;
  }

  closeFormModal(): void {
    this.formEditingEvent = null;
    this.formModalOpen = false;
  }

  closeDetailsModal(): void {
    this.selectedEvent = null;
  }

  onEventSaved(): void {
    this.closeFormModal();
    this.selectedEvent = null;
    this.loadDashboard();
    this.showToast('Event saved successfully.', 'success');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 4000);
  }

  eventsListNextPage(): void {
    if (this.eventsListPage + 1 < this.eventsListTotalPages) {
      this.eventsListPage++;
      this.loadEventsListPage();
    }
  }

  eventsListPreviousPage(): void {
    if (this.eventsListPage > 0) {
      this.eventsListPage--;
      this.loadEventsListPage();
    }
  }

  loadEventsListPage(): void {
    if (!this.eventsListModalOpen) return;
    this.isEventsListLoading = true;
    this.eventService.getAllEventsPaged({}, this.eventsListPage, this.eventsListPageSize).subscribe({
      next: (page) => {
        this.eventsList = page.content;
        this.eventsListTotal = page.totalElements;
        this.eventsListTotalPages = page.totalPages;
        this.isEventsListLoading = false;
      },
      error: (err) => {
        console.error('Failed to load events list page:', err);
        this.error = 'Unable to load events list.';
        this.isEventsListLoading = false;
      }
    });
  }

  openEventsListModal(): void {
    this.eventsListModalOpen = true;
    this.isEventsListLoading = true;
    this.eventsListPage = 0;
    this.eventService.getAllEventsPaged({}, this.eventsListPage, this.eventsListPageSize).subscribe({
      next: (page) => {
        this.eventsList = page.content;
        this.eventsListTotal = page.totalElements;
        this.eventsListTotalPages = page.totalPages;
        this.isEventsListLoading = false;
      },
      error: (err) => {
        console.error('Failed to load events list:', err);
        this.error = 'Unable to load events list.';
        this.isEventsListLoading = false;
      }
    });
  }

  closeEventsListModal(): void {
    this.eventsListModalOpen = false;
    this.eventsList = [];
    this.eventsListPage = 0;
    this.eventsListTotal = 0;
    this.eventsListTotalPages = 0;
  }

  openArchiveModal(): void {
    this.showArchiveModal = true;
    this.archiveLoading = true;
    this.archiveError = null;
    this.eventService.getArchivedEvents().subscribe({
      next: (events) => {
        this.archivedEvents = events;
        this.archiveLoading = false;
      },
      error: () => {
        this.archiveError = 'Unable to load archived events.';
        this.archiveLoading = false;
      }
    });
  }

  closeArchiveModal(): void {
    this.showArchiveModal = false;
    this.archivedEvents = [];
  }

  openUserView(): void {
    this.router.navigate(['/events']);
  }

  viewEvent(event: Event): void {
    if (event.idEvenement && (!event.dateDebut || !event.heureDebut)) {
      this.eventService.getEventById(event.idEvenement).subscribe({
        next: (fullEvent) => {
          this.selectedEvent = fullEvent;
        },
        error: () => {
          console.error('Failed to load event details:', event.idEvenement);
        }
      });
      return;
    }
    this.selectedEvent = event;
  }

  editEvent(event: Event): void {
    this.openEditEvent(event);
  }

  deleteEvent(event: Event): void {
    this.deleteTargetEvent = event;
    this.deleteEmailSubject = 'Event Cancellation Notice';
    this.deleteEmailContent = '';
    this.emailSent = false;
    this.emailSentSuccess = false;
    this.emailError = null;
    this.showDeleteModal = true;
  }

  sendCancellationEmail(): void {
    if (!this.deleteTargetEvent?.idEvenement) return;

    const eventName = this.deleteTargetEvent.titre;
    const subject = this.deleteEmailSubject?.trim() || 'Event Cancellation Notice';
    const content = (this.deleteEmailContent?.trim() || `Hello,

We regret to inform you that the event "${eventName}" has been cancelled by the administration and will no longer take place.

We sincerely apologize for any inconvenience this may cause.

Thank you for your interest and participation.

Best regards,
Esprit Connect Team`);

    this.emailSending = true;
    this.emailError = null;
    this.emailSentSuccess = false;

    this.eventService.deleteEventWithEmail(this.deleteTargetEvent.idEvenement, { subject, content }).subscribe({
      next: () => {
        this.emailSent = true;
        this.emailSending = false;
        this.emailSentSuccess = true;
      },
      error: (err) => {
        console.error('Failed to send cancellation email:', err);
        this.emailError = err?.error?.error || 'Unable to send cancellation email.';
        this.emailSending = false;
        this.emailSent = false;
      }
    });
  }

  confirmDelete(): void {
    if (!this.emailSent || !this.deleteTargetEvent?.idEvenement) return;

    this.eventService.deleteEvent(this.deleteTargetEvent.idEvenement).subscribe({
      next: () => {
        const eventName = this.deleteTargetEvent?.titre || 'Event';
        this.showDeleteModal = false;
        this.deleteTargetEvent = null;
        this.emailSentSuccess = false;
        this.loadDashboard();
        if (this.eventsListModalOpen) {
          this.openEventsListModal();
        }
        this.showToast(`Event "${eventName}" deleted successfully.`, 'success');
      },
      error: (err) => {
        console.error('Failed to delete event:', err);
        this.error = 'Unable to delete this event.';
        this.showToast('Failed to delete event. Please try again.', 'error');
      }
    });
  }

  closeDeleteModal(): void {
    if (this.emailSending) return;
    this.showDeleteModal = false;
    this.deleteTargetEvent = null;
    this.emailSentSuccess = false;
    this.emailError = null;
  }

  trackEvent(index: number, event: Event): number {
    return event.idEvenement ?? index;
  }
}
