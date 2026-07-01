import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { ForumCategory, ForumPost } from '../../models/forum-client.models';
import { ForumClientService } from '../../services/forum-client.service';
import { CreatePostStateService } from '../../services/create-post-state.service';
import { ViewModeService } from '../../../../shared/layout/services/view-mode.service';
import { AuthService } from '../../../../auth.service';

@Component({
  selector: 'app-forum-home-client',
  templateUrl: './forum-home.component.html',
  styleUrls: ['./forum-home.component.css']
})
export class ForumHomeComponent implements OnInit, OnDestroy {
  categories: ForumCategory[] = [];
  posts: ForumPost[] = [];
  allPosts: ForumPost[] = [];

  selectedCategoryId?: number;
  searchText = '';

  loading = false;
  saving = false;

  showCreateModal = false;

  activeFilter: 'all' | 'mine' | 'liked' = 'all';
  activeSort: 'date' | 'likes' | 'views' = 'date';
  likedPostIds: number[] = [];
  activeTab = '';
  userRole: string | null = null;

  private routeSub?: Subscription;

  constructor(
    private readonly api: ForumClientService,
    private readonly createState: CreatePostStateService,
    public readonly viewMode: ViewModeService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.likedPostIds = JSON.parse(localStorage.getItem('forum_liked_posts') || '[]');
    this.loadCategories();
    
    // Subscribe to query parameters to handle sidebar filtering and action triggers
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.openCreate();
      } else {
        this.showCreateModal = false;
      }

      if (params['filter'] === 'mine') {
        this.activeFilter = 'mine';
      } else if (params['filter'] === 'liked') {
        this.activeFilter = 'liked';
      } else {
        this.activeFilter = 'all';
      }

      if (params['tab']) {
        this.activeTab = params['tab'];
      } else {
        this.activeTab = '';
      }

      this.loadPosts();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Error chargement catégories', err)
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.api
      .getPosts()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.allPosts = res;
          this.applyFiltersAndSort();
        },
        error: (err) => console.error('Error chargement posts', err)
      });
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.allPosts];

    // 1. Category filter
    if (this.selectedCategoryId !== undefined) {
      filtered = filtered.filter(p => p.category?.id === this.selectedCategoryId);
    }

    // 2. Search query filter
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) || 
        p.authorName?.toLowerCase().includes(q)
      );
    }

    // 3. User contributions / Liked filter
    const mode = this.viewMode.getCurrentMode();
    const currentEmail = mode === 'alumni' ? 'alumni.demo@esprit.tn' : 'etudiant.demo@esprit.tn';
    
    if (this.activeFilter === 'mine') {
      filtered = filtered.filter(p => p.authorEmail === currentEmail);
    } else if (this.activeFilter === 'liked') {
      filtered = filtered.filter(p => this.likedPostIds.includes(p.id));
    }

    // 4. Custom sorting
    if (this.activeSort === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (this.activeSort === 'likes') {
      filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (this.activeSort === 'views') {
      filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    this.posts = filtered;
  }

  filterByCategory(catId?: number): void {
    this.selectedCategoryId = catId;
    this.applyFiltersAndSort();
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  setSort(sort: 'date' | 'likes' | 'views'): void {
    this.activeSort = sort;
    this.applyFiltersAndSort();
  }

  clearActiveFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: null, action: null },
      queryParamsHandling: 'merge'
    });
  }

  clearActiveTab(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: null },
      queryParamsHandling: 'merge'
    });
  }

  openCreate(): void {
    this.createState.reset();
    this.showCreateModal = true;
  }

  closeCreate(): void {
    this.showCreateModal = false;
    this.createState.reset();
    
    // Clean up query byam if they cancel
    if (this.route.snapshot.queryParams['action'] === 'create') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { action: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  toggleLike(post: ForumPost, event: Event): void {
    event.stopPropagation();
    const idx = this.likedPostIds.indexOf(post.id);
    if (idx === -1) {
      this.likedPostIds.push(post.id);
      post.likesCount = (post.likesCount || 0) + 1;
    } else {
      this.likedPostIds.splice(idx, 1);
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
    }
    localStorage.setItem('forum_liked_posts', JSON.stringify(this.likedPostIds));
    this.applyFiltersAndSort();
  }

  submitCreate(): void {
    const draft = this.createState.value;
    if (!draft.title.trim() || !draft.content.trim() || !draft.category?.id) return;

    this.saving = true;

    const headerLines: string[] = [];
    if (draft.website?.trim()) headerLines.push(`Lien: ${draft.website.trim()}`);
    if (draft.tags.length) headerLines.push(`Tags: ${draft.tags.join(' ')}`);
    const composedContent = headerLines.length ? `${headerLines.join('\n')}\n\n${draft.content}` : draft.content;

    const authorRole = this.viewMode.getCurrentMode() === 'alumni' ? 'ALUMNI' : 'ETUDIANT';
    const payload = {
      title: draft.title.trim(),
      content: composedContent,
      category: { id: draft.category.id },
      authorName: authorRole === 'ALUMNI' ? 'Alumni Demo' : 'Student Demo',
      authorEmail: authorRole === 'ALUMNI' ? 'alumni.demo@esprit.tn' : 'etudiant.demo@esprit.tn',
      authorRole
    };

    this.api
      .createPost(payload as any)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.closeCreate();
          this.loadPosts();
        },
        error: (err) => console.error('Error création post', err)
      });
  }
}

