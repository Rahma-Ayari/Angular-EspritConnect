import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ForumPost } from '../../models/forum-client.models';
import { ForumClientService } from '../../services/forum-client.service';
import { ViewModeService } from '../../../../shared/layout/services/view-mode.service';

@Component({
  selector: 'app-forum-detail-client',
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css']
})
export class ForumDetailComponent implements OnInit {
  post?: ForumPost;
  loading = false;

  newReply = '';
  submitting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ForumClientService,
    private readonly viewMode: ViewModeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost(id);
  }

  loadPost(id: number): void {
    this.loading = true;
    this.api
      .getPostById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => (this.post = res),
        error: (err) => console.error('Error chargement post', err)
      });
  }

  submitReply(): void {
    if (!this.post || !this.newReply.trim()) return;
    this.submitting = true;

    const authorRole = this.viewMode.getCurrentMode() === 'alumni' ? 'ALUMNI' : 'ETUDIANT';
    const payload = {
      content: this.newReply.trim(),
      authorName: authorRole === 'ALUMNI' ? 'Alumni Demo' : 'Student Demo',
      authorEmail: authorRole === 'ALUMNI' ? 'alumni.demo@esprit.tn' : 'etudiant.demo@esprit.tn',
      authorRole
    };

    this.api
      .addReply(this.post.id, payload as any)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.newReply = '';
          this.loadPost(this.post!.id);
        },
        error: (err) => console.error('Error ajout réponse', err)
      });
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ETUDIANT':
        return 'Student';
      case 'ALUMNI':
        return 'Alumni';
      case 'ENSEIGNANT':
        return 'Enseignant';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Member';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ETUDIANT':
        return '#0284c7'; // Blue sky for Student
      case 'ALUMNI':
        return '#7c3aed'; // Royal Violet for Alumni
      case 'ENSEIGNANT':
        return '#059669'; // Emerald for Teacher
      case 'ADMIN':
        return '#e11d48'; // Rose/Red for Admin
      default:
        return '#64748b';
    }
  }
}

