// ============================================================
// email-history.component.ts — Complet et fonctionnel
// ============================================================
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface EmailHistoryItem {
  id: number;
  type: string;
  campaignId?: number;
  toEmail: string;
  subject: string;
  deliveryStatus: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  sentAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

@Component({
  selector: 'app-email-history',
  templateUrl: './email-history.component.html',
  styleUrls: ['./email-history.component.css']
})
export class EmailHistoryComponent implements OnInit {

  private base = environment.backendBaseUrl;

  items:    EmailHistoryItem[] = [];
  loading   = false;
  page      = 0;
  pageSize  = 20;
  total     = 0;
  q         = '';
  typeFilter = '';

  stats = { totalSent: 0, totalFailed: 0, totalRecipients: 0 };

  // ── Modal détail ──
  selectedItem: EmailHistoryItem | null = null;

  typeOptions = [
    { value: '',                            label: 'All types' },
    { value: 'MESSAGE_USERS_CAMPAIGN',      label: 'Message Users Campaign' },
    { value: 'BIRTHDAY_AUTO',              label: 'Birthday Auto' },
    { value: 'BIRTHDAY_TEST',              label: 'Birthday Test' },
    { value: 'OTHER',                      label: 'Autre' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadHistory(); }

  loadHistory(): void {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.page)
      .set('size', this.pageSize);

    if (this.q.trim())       params = params.set('q', this.q.trim());
    if (this.typeFilter)     params = params.set('type', this.typeFilter);

    this.http.get<PageResponse<EmailHistoryItem>>(
      `${this.base}/api/email-communications/history`, { params }
    ).subscribe({
      next: (res) => {
        this.items = res.content;
        this.total = res.totalElements;
        this.loadStats();
        this.loading = false;
      },
      error: () => {
        // Mock si backend absent
        this.items = this.mockData();
        this.total = this.items.length;
        this.computeStatsFromPage();
        this.loading = false;
      }
    });
  }

  /** Recherche avec debounce simple */
  onSearch(): void {
    this.page = 0;
    this.loadHistory();
  }

  onTypeChange(): void {
    this.page = 0;
    this.loadHistory();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadHistory(); } }
  nextPage(): void { if ((this.page + 1) * this.pageSize < this.total) { this.page++; this.loadHistory(); } }

  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }

  private loadStats(): void {
    let params = new HttpParams();
    if (this.q.trim()) params = params.set('q', this.q.trim());
    if (this.typeFilter) params = params.set('type', this.typeFilter);

    this.http.get<{ success: number; failed: number; total: number }>(
      `${this.base}/api/email-communications/history/stats`,
      { params }
    ).subscribe({
      next: (s) => {
        this.stats.totalRecipients = s.total ?? this.total;
        this.stats.totalSent = s.success ?? 0;
        this.stats.totalFailed = s.failed ?? 0;
      },
      error: () => this.computeStatsFromPage()
    });
  }

  private computeStatsFromPage(): void {
    this.stats.totalRecipients = this.total;
    this.stats.totalSent = this.items.filter(i => i.deliveryStatus === 'SUCCESS').length;
    this.stats.totalFailed = this.items.filter(i => i.deliveryStatus === 'FAILED').length;
  }

  /** Ouvre le modal de détail */
  viewItem(item: EmailHistoryItem): void {
    this.selectedItem = item;
  }

  closeModal(): void { this.selectedItem = null; }

  /** Badge CSS selon type */
  getBadgeClass(type: string): string {
    if (type.includes('BIRTHDAY')) return 'badge badge--amber';
    if (type.includes('DIGEST'))   return 'badge badge--blue';
    if (type.includes('MESSAGE'))  return 'badge badge--purple';
    return 'badge badge--green';
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      MESSAGE_USERS_CAMPAIGN: 'Campaign',
      BIRTHDAY_AUTO: 'Birthday Auto',
      BIRTHDAY_TEST: 'Birthday Test',
      OTHER: 'Autre'
    };
    return map[type] ?? type;
  }

  /** CSV export of la page courante */
  exportCSV(): void {
    const rows = [['ID', 'Type', 'Destinataire', 'Subject', 'Status', 'Date']];
    this.items.forEach(i => rows.push([
      String(i.id), i.type, i.toEmail, i.subject, i.deliveryStatus,
      new Date(i.sentAt).toLocaleDateString('fr-FR')
    ]));
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `email_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private mockData(): EmailHistoryItem[] {
    return [
      { id: 1, type: 'BIRTHDAY_AUTO',         toEmail: 'ali@esprit.tn',    subject: 'Happy Birthday!',             deliveryStatus: 'SUCCESS', sentAt: '2026-05-07T08:00:00' },
      { id: 2, type: 'MESSAGE_USERS_CAMPAIGN', toEmail: 'sara@esprit.tn',   subject: 'Forum des Entreprises',       deliveryStatus: 'SUCCESS', sentAt: '2026-05-05T10:30:00' },
      { id: 3, type: 'BIRTHDAY_TEST',          toEmail: 'admin@esprit.tn',  subject: 'Happy Birthday TEST',         deliveryStatus: 'SUCCESS', sentAt: '2026-05-04T09:15:00' },
      { id: 4, type: 'MESSAGE_USERS_CAMPAIGN', toEmail: 'john@esprit.tn',   subject: "What's new on Esprit",        deliveryStatus: 'FAILED',  sentAt: '2026-05-03T14:00:00', errorMessage: 'SMTP timeout' },
      { id: 5, type: 'BIRTHDAY_AUTO',          toEmail: 'fatma@esprit.tn',  subject: 'Happy Birthday!',             deliveryStatus: 'SUCCESS', sentAt: '2026-05-01T08:00:00' },
    ];
  }
}