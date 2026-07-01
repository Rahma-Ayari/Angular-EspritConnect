import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { ForumCategory, ForumPost, ForumReply } from '../../models/forum.models';

@Component({
  selector: 'app-forum-posts',
  templateUrl: './forum-posts.component.html',
  styleUrls: ['./forum-posts.component.css']
})
export class ForumPostsComponent implements OnInit {

  posts: ForumPost[] = [];
  categories: ForumCategory[] = [];

  // Filter States
  selectedCategory: number | undefined = undefined;
  selectedRole = '';
  showOnlyReported = false;
  searchText = '';

  // Thread detail modal
  selectedPost: ForumPost | null = null;
  showDetailModal = false;

  // Admin reply form
  newReplyContent = '';
  submittingReply = false;

  loading = true;
  successMsg = '';
  errorMsg = '';

  constructor(private forumService: ForumService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.forumService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadPosts();
      },
      error: () => {
        this.errorMsg = "Unable to load categories.";
        this.loading = false;
      }
    });
  }

  loadPosts(): void {
    this.loading = true;
    const filters = {
      categoryId: this.selectedCategory,
      authorRole: this.selectedRole,
      reported: this.showOnlyReported ? true : undefined,
      search: this.searchText
    };

    this.forumService.getPosts(filters).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = "Unable to load posts.";
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadPosts();
  }

  clearFilters(): void {
    this.selectedCategory = undefined;
    this.selectedRole = '';
    this.showOnlyReported = false;
    this.searchText = '';
    this.loadPosts();
  }

  togglePin(post: ForumPost): void {
    if (!post.id) return;
    this.forumService.togglePinPost(post.id).subscribe({
      next: (updatedPost) => {
        post.pinned = updatedPost.pinned;
        this.showSuccess(post.pinned ? "Post pinned to top!" : "Post unpinned.");
      },
      error: () => this.showError("Error pinning post.")
    });
  }

  deletePost(post: ForumPost): void {
    if (!post.id || !confirm(`Voulez-vous vraiment supprimer définitivement la publication "${post.title}" ?`)) return;
    this.forumService.deletePost(post.id).subscribe({
      next: () => {
        this.showSuccess("Post deleted successfully.");
        if (this.selectedPost?.id === post.id) {
          this.closeDetailModal();
        }
        this.loadPosts();
      },
      error: () => this.showError("Error deleting post.")
    });
  }

  approvePost(post: ForumPost): void {
    if (!post.id) return;
    this.forumService.resolvePostReport(post.id).subscribe({
      next: () => {
        post.reported = false;
        post.reportReason = undefined;
        this.showSuccess("Report resolved and archived.");
      },
      error: () => this.showError("Error validating post.")
    });
  }

  // --- DETAILS THREAD & MODERATION INDIVIDUELLE ---

  openDetailModal(post: ForumPost): void {
    if (!post.id) return;
    // Charge les détails complets (avec replies incrémentées)
    this.forumService.getPostById(post.id).subscribe({
      next: (fullPost) => {
        this.selectedPost = fullPost;
        this.newReplyContent = '';
        this.showDetailModal = true;
      },
      error: () => this.showError("Unable to load discussion thread.")
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPost = null;
  }

  // Admin replies to thread
  submitReply(): void {
    if (!this.newReplyContent.trim() || !this.selectedPost || !this.selectedPost.id) return;

    const payload: ForumReply = {
      content: this.newReplyContent.trim(),
      authorName: "Direction Generale Esprit",
      authorEmail: "admin.connect@esprit.tn",
      authorRole: "ADMIN",
      reported: false
    };

    this.submittingReply = true;
    this.forumService.addReply(this.selectedPost.id, payload).subscribe({
      next: (createdReply) => {
        if (this.selectedPost) {
          if (!this.selectedPost.replies) this.selectedPost.replies = [];
          this.selectedPost.replies.push(createdReply);
        }
        this.newReplyContent = '';
        this.submittingReply = false;
        this.showSuccess("Your official reply was published!");
        // Recharge le post liste en arrière plan
        this.loadPosts();
      },
      error: () => {
        this.showError("Unable to add reply.");
        this.submittingReply = false;
      }
    });
  }

  deleteReply(reply: ForumReply): void {
    if (!reply.id || !confirm("Voulez-vous supprimer définitivement ce commentaire ?")) return;
    this.forumService.deleteReply(reply.id).subscribe({
      next: () => {
        if (this.selectedPost && this.selectedPost.replies) {
          this.selectedPost.replies = this.selectedPost.replies.filter(r => r.id !== reply.id);
        }
        this.showSuccess("Commentaire supprimé.");
        this.loadPosts();
      },
      error: () => this.showError("Error deleting comment.")
    });
  }

  approveReply(reply: ForumReply): void {
    if (!reply.id) return;
    this.forumService.resolveReplyReport(reply.id).subscribe({
      next: () => {
        reply.reported = false;
        reply.reportReason = undefined;
        this.showSuccess("Comment report resolved.");
      },
      error: () => this.showError("Error resolving comment.")
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ETUDIANT': 'Student',
      'ALUMNI': 'Alumni',
      'ENSEIGNANT': 'Enseignant',
      'ADMIN': 'Admin',
      'ENTREPRISE': 'Company'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'ETUDIANT': 'var(--blue)',
      'ALUMNI': 'var(--purple)',
      'ENSEIGNANT': 'var(--green)',
      'ADMIN': 'var(--red)',
      'ENTREPRISE': 'var(--amber)'
    };
    return colors[role] || 'var(--muted)';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
