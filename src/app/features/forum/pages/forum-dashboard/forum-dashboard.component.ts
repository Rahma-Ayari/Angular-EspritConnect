import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { ForumStats, ForumPost, ForumReply } from '../../models/forum.models';

@Component({
  selector: 'app-forum-dashboard',
  templateUrl: './forum-dashboard.component.html',
  styleUrls: ['./forum-dashboard.component.css']
})
export class ForumDashboardComponent implements OnInit {

  stats: ForumStats = {
    totalPosts: 0,
    totalReplies: 0,
    totalReported: 0,
    reportedPostsCount: 0,
    reportedRepliesCount: 0,
    totalCategories: 0,
    roleDistribution: {}
  };

  reportedPosts: ForumPost[] = [];
  reportedReplies: ForumReply[] = [];

  loading = true;
  successMsg = '';
  errorMsg = '';

  constructor(private forumService: ForumService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.forumService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadReportedContent();
      },
      error: (err) => {
        this.errorMsg = "Unable to load forum statistics.";
        this.loading = false;
      }
    });
  }

  loadReportedContent(): void {
    this.forumService.getReportedPosts().subscribe({
      next: (posts) => {
        this.reportedPosts = posts;
        this.forumService.getReportedReplies().subscribe({
          next: (replies) => {
            this.reportedReplies = replies;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Action: Approve reported post (unflag)
  approvePost(post: ForumPost): void {
    if (!post.id) return;
    this.forumService.resolvePostReport(post.id).subscribe({
      next: () => {
        this.showSuccess("Post report approved and resolved!");
        this.loadData();
      },
      error: () => this.showError("Error resolving post.")
    });
  }

  // Action: Delete reported post
  deletePost(post: ForumPost): void {
    if (!post.id || !confirm("Voulez-vous vraiment supprimer définitivement cette publication inappropriée ?")) return;
    this.forumService.deletePost(post.id).subscribe({
      next: () => {
        this.showSuccess("Inappropriate post deleted successfully!");
        this.loadData();
      },
      error: () => this.showError("Error deleting post.")
    });
  }

  // Action: Approve reported reply (unflag)
  approveReply(reply: ForumReply): void {
    if (!reply.id) return;
    this.forumService.resolveReplyReport(reply.id).subscribe({
      next: () => {
        this.showSuccess("Comment report approved and resolved!");
        this.loadData();
      },
      error: () => this.showError("Error resolving comment.")
    });
  }

  // Action: Delete reported reply
  deleteReply(reply: ForumReply): void {
    if (!reply.id || !confirm("Voulez-vous vraiment supprimer définitivement ce commentaire inapproprié ?")) return;
    this.forumService.deleteReply(reply.id).subscribe({
      next: () => {
        this.showSuccess("Commentaire inapproprié supprimé avec succès !");
        this.loadData();
      },
      error: () => this.showError("Error deleting comment.")
    });
  }

  getRolePercentage(role: string): number {
    const total = Object.values(this.stats.roleDistribution).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const val = this.stats.roleDistribution[role] || 0;
    return Math.round((val / total) * 100);
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ETUDIANT': 'Students',
      'ALUMNI': 'Alumni',
      'ENSEIGNANT': 'Enseignants',
      'ADMIN': 'Administrators',
      'ENTREPRISE': 'Companies'
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
