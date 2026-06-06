import { Component, OnInit } from '@angular/core';
import { JobsBackofficeService, ImportFeed } from '../../../services/jobs-backoffice.service';

type Provider = 'handshake' | 'symplicity' | 'custom';

@Component({
  selector: 'app-jobs-import',
  templateUrl: './jobs-import.component.html',
  styleUrls: ['./jobs-import.component.css']
})
export class JobsImportComponent implements OnInit {
  feeds: ImportFeed[] = [];
  selectedProvider: Provider = 'handshake';
  feedUrl = '';
  saveMessage = '';
  activeTab: 'automated' | 'history' = 'automated';

  constructor(private jobsService: JobsBackofficeService) {}

  ngOnInit(): void {
    this.feeds = this.jobsService.loadImports();
  }

  saveFeed(): void {
    if (!this.feedUrl.trim()) return;
    const item: ImportFeed = {
      id: crypto.randomUUID(),
      provider: this.selectedProvider,
      feedUrl: this.feedUrl.trim(),
      updatedAt: new Date().toISOString()
    };
    this.feeds = [item, ...this.feeds];
    this.jobsService.saveImports(this.feeds);
    this.feedUrl = '';
    this.saveMessage = 'Import feed saved.';
    setTimeout(() => (this.saveMessage = ''), 2200);
  }

  removeFeed(id: string): void {
    this.feeds = this.feeds.filter(f => f.id !== id);
    this.jobsService.saveImports(this.feeds);
  }
}
