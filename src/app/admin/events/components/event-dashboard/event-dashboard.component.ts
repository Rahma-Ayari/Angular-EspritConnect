import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, EventStats } from '../../models/event.model';
import { ArchiveEvent, PageResponse } from '../../models/event.model';

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

  paginatedPage = 0;
  paginatedSize = 7;
  paginatedTotal = 0;
  paginatedTotalPages = 0;
  currentPageEvents: Event[] = [];
  pageLoading = false;

  searchQuery = '';
  selectedStatus = '';
  selectedType = '';
  eventTypes: string[] = [];
  formModalOpen = false;
  formEditingEvent: Event | null = null;
  selectedEvent: Event | null = null;
  eventsListModalOpen = false;

  readonly statuses = ['ACTIVE', 'UPCOMING', 'CANCELLED', 'COMPLETED'];

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
    this.loadPaginatedEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    this.eventService.getAllEvents({
      search: this.searchQuery,
      status: this.selectedStatus,
      type: this.selectedType
    }).subscribe({
      next: (events) => {
        this.events = events.filter(event => event.status !== 'COMPLETED');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = 'Unable to load events.';
        this.isLoading = false;
      }
    });
  }

  loadPaginatedEvents(): void {
    this.pageLoading = true;
    this.error = null;

    this.eventService.getAllEventsPaged({
      search: this.searchQuery,
      status: this.selectedStatus,
      type: this.selectedType
    }, this.paginatedPage, this.paginatedSize).subscribe({
      next: (page) => {
        this.currentPageEvents = page.content.filter(event => event.status !== 'COMPLETED');
        this.paginatedTotal = page.totalElements;
        this.paginatedTotalPages = page.totalPages;
        this.paginatedPage = page.number;
        this.pageLoading = false;
      },
      error: (err) => {
        console.error('Failed to load paged events:', err);
        this.error = 'Unable to load events.';
        this.pageLoading = false;
      }
    });
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
    this.paginatedPage = 0;
    this.loadEvents();
    this.loadPaginatedEvents();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  nextPage(): void {
    if (this.paginatedPage + 1 < this.paginatedTotalPages) {
      this.paginatedPage++;
      this.loadPaginatedEvents();
    }
  }

  previousPage(): void {
    if (this.paginatedPage > 0) {
      this.paginatedPage--;
      this.loadPaginatedEvents();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.paginatedTotalPages) {
      this.paginatedPage = page;
      this.loadPaginatedEvents();
    }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.paginatedPage - 2);
    const end = Math.min(this.paginatedTotalPages - 1, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
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
  }

  openEventsListModal(): void {
    this.eventsListModalOpen = true;
    this.isEventsListLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.eventsList = events.filter(event => event.status !== 'COMPLETED');
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
        this.showDeleteModal = false;
        this.deleteTargetEvent = null;
        this.emailSentSuccess = false;
        this.loadDashboard();
        if (this.eventsListModalOpen) {
          this.openEventsListModal();
        }
      },
      error: (err) => {
        console.error('Failed to delete event:', err);
        this.error = 'Unable to delete this event.';
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
