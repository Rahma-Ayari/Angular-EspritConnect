import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SupportService } from '../../services/support.service';
import { FAQ } from '../../models/faq.model';
import { TicketCategory } from '../../models/support.model';

@Component({
  selector: 'app-faq-knowledge-base',
  templateUrl: './faq-knowledge-base.component.html',
  styleUrls: ['./faq-knowledge-base.component.css']
})
export class FaqKnowledgeBaseComponent implements OnInit, OnDestroy {
  allFaqs: FAQ[] = [];
  filteredFaqs: FAQ[] = [];
  popularFaqs: FAQ[] = [];
  categories: TicketCategory[] = [];

  searchQuery = '';
  selectedCategoryId: number | null = null;
  activeFilter: 'all' | 'important' | 'popular' = 'all';

  expandedFaqId: number | null = null;
  votedFaqIds = new Set<number>();
  loading = true;
  searchLoading = false;
  errorMessage = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private supportService: SupportService) {}

  ngOnInit(): void {
    this.loadData();

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.supportService.getCategories().subscribe({
      next: cats => {
        this.categories = cats;
        this.supportService.getAllFAQs().subscribe({
          next: faqs => {
            this.allFaqs = faqs.filter(f => f.id !== 0);
            this.filteredFaqs = [...this.allFaqs];
            this.loading = false;
          },
          error: err => {
            console.error('Failed to load FAQs:', err);
            this.loading = false;
            this.errorMessage = err.status === 401 || err.status === 403
              ? 'You must be logged in to view FAQs.'
              : 'Could not load FAQs. The server may be unavailable.';
          }
        });
      },
      error: err => {
        console.error('Failed to load categories:', err);
        this.loading = false;
        this.errorMessage = err.status === 401 || err.status === 403
          ? 'You must be logged in to view this page.'
          : 'Could not load data. The server may be unavailable.';
      }
    });
    this.supportService.getPopularFAQs().subscribe({
      next: pop => { this.popularFaqs = pop.filter(f => f.id !== 0); },
      error: err => { console.warn('Failed to load popular FAQs:', err); }
    });
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    if (!value.trim()) {
      this.applyFilters();
      return;
    }
    this.searchSubject.next(value.trim());
  }

  performSearch(query: string): void {
    this.searchLoading = true;
    this.supportService.searchFAQs(query).subscribe(results => {
      this.filteredFaqs = results.filter(f => f.id !== 0);
      this.searchLoading = false;
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'important' | 'popular'): void {
    this.activeFilter = filter;
    this.selectedCategoryId = null;
    this.searchQuery = '';

    if (filter === 'important') {
      this.supportService.getImportantFAQs().subscribe(faqs => {
        this.filteredFaqs = faqs.filter(f => f.id !== 0);
      });
    } else if (filter === 'popular') {
      this.filteredFaqs = [...this.popularFaqs];
    } else {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let result = [...this.allFaqs];
    if (this.selectedCategoryId) {
      result = result.filter(f => f.categoryId === this.selectedCategoryId);
    }
    this.filteredFaqs = result;
  }

  toggleFaq(faq: FAQ): void {
    if (this.expandedFaqId === faq.id) {
      this.expandedFaqId = null;
    } else {
      this.expandedFaqId = faq.id;
      // Increment view count
      this.supportService.incrementFAQView(faq.id).subscribe(updated => {
        const idx = this.allFaqs.findIndex(f => f.id === updated.id);
        if (idx > -1) this.allFaqs[idx] = updated;
        const idx2 = this.filteredFaqs.findIndex(f => f.id === updated.id);
        if (idx2 > -1) this.filteredFaqs[idx2] = updated;
      });
    }
  }

  vote(faqId: number, helpful: boolean, event: MouseEvent): void {
    event.stopPropagation();
    if (this.votedFaqIds.has(faqId)) return;
    this.votedFaqIds.add(faqId);

    this.supportService.voteOnFAQ(faqId, helpful).subscribe(updated => {
      const idx = this.filteredFaqs.findIndex(f => f.id === updated.id);
      if (idx > -1) this.filteredFaqs[idx] = updated;
      const idx2 = this.allFaqs.findIndex(f => f.id === updated.id);
      if (idx2 > -1) this.allFaqs[idx2] = updated;
    });
  }

  hasVoted(faqId: number): boolean {
    return this.votedFaqIds.has(faqId);
  }

  getCategoryFaqCount(categoryId: number): number {
    return this.allFaqs.filter(f => f.categoryId === categoryId).length;
  }

  getCategoryIcon(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('account')) return 'fa-user-circle';
    if (n.includes('event')) return 'fa-calendar';
    if (n.includes('job')) return 'fa-briefcase';
    if (n.includes('forum')) return 'fa-comments';
    if (n.includes('security')) return 'fa-shield-halved';
    if (n.includes('tech') || n.includes('bug')) return 'fa-wrench';
    if (n.includes('auth') || n.includes('login') || n.includes('password')) return 'fa-key';
    if (n.includes('report') || n.includes('content')) return 'fa-flag';
    if (n.includes('suggest') || n.includes('improve')) return 'fa-lightbulb';
    return 'fa-circle-question';
  }

  getHelpfulPercent(faq: FAQ): number {
    const total = faq.helpfulCount + faq.notHelpfulCount;
    if (total === 0) return 0;
    return Math.round((faq.helpfulCount / total) * 100);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.activeFilter = 'all';
    this.filteredFaqs = [...this.allFaqs];
  }

  getSelectedCategoryName(): string {
    if (!this.selectedCategoryId) return '';
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat ? cat.name : '';
  }

  trackByFaqId(index: number, faq: FAQ): number {
    return faq.id;
  }
}
