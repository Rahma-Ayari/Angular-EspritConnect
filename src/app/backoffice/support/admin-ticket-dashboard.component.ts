import { Component, OnInit } from '@angular/core';
import { SupportService } from '../../services/support.service';
import { SupportTicket, TicketStatus, TicketPriority, TicketCategory } from '../../models/support.model';

@Component({
  selector: 'app-admin-ticket-dashboard',
  templateUrl: './admin-ticket-dashboard.component.html',
  styleUrls: ['./admin-ticket-dashboard.component.css']
})
export class AdminTicketDashboardComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  categories: TicketCategory[] = [];
  priorities = Object.values(TicketPriority);

  statusFilter: string = 'ALL';
  priorityFilter: string = 'ALL';
  categoryFilter: string = 'ALL';
  searchQuery: string = '';
  
  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  };

  constructor(private supportService: SupportService) {}

  ngOnInit(): void {
    this.loadAllTickets();
    this.supportService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadAllTickets(): void {
    this.supportService.getAllTicketsAdmin().subscribe(data => {
      this.tickets = data;
      this.calculateStats();
      this.applyFilter();
    });
  }

  calculateStats(): void {
    this.stats.total = this.tickets.length;
    this.stats.open = this.tickets.filter(t => t.status === TicketStatus.OPEN).length;
    this.stats.inProgress = this.tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
    this.stats.resolved = this.tickets.filter(t => t.status === TicketStatus.RESOLVED).length;
  }

  applyFilter(): void {
    const status = this.statusFilter === 'ALL' ? undefined : this.statusFilter;
    const priority = this.priorityFilter === 'ALL' ? undefined : this.priorityFilter;
    const categoryId = this.categoryFilter === 'ALL' ? undefined : Number(this.categoryFilter);
    const search = this.searchQuery.trim() === '' ? undefined : this.searchQuery;

    this.supportService.searchAndFilterTickets(status, priority, categoryId, search).subscribe(data => {
      this.filteredTickets = data;
    });
  }

  onFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  onPriorityChange(priority: string): void {
    this.priorityFilter = priority;
    this.applyFilter();
  }

  onCategoryChange(catId: string): void {
    this.categoryFilter = catId;
    this.applyFilter();
  }

  onSearch(): void {
    this.applyFilter();
  }
}
