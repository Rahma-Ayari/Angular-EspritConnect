import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ForumPost } from '../../models/forum-client.models';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
  @Input() post!: ForumPost;
  @Input() isLiked = false;
  @Output() open = new EventEmitter<number>();
  @Output() like = new EventEmitter<Event>();

  constructor(private readonly router: Router) {}

  goToDetail(): void {
    this.open.emit(this.post.id);
    this.router.navigate(['/user/forum/posts', this.post.id]);
  }

  onLikeClick(event: Event): void {
    event.stopPropagation();
    this.like.emit(event);
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

