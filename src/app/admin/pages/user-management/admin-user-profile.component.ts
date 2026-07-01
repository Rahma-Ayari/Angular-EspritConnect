import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService, Profile } from '../../../services/profile.service';
import { ActivityService } from '../../../services/activity.service';
import { UserActivityInfo } from '../../../models/user-activity-info.model';

@Component({
  selector: 'app-admin-user-profile',
  templateUrl: './admin-user-profile.component.html',
  styleUrls: ['./admin-user-profile.component.css']
})
export class AdminUserProfileComponent implements OnInit {
  profile: Profile = {};
  activityInfo: UserActivityInfo | null = null;
  isLoading = false;
  isLoadingActivity = false;
  error = '';

  constructor(
    private profileService: ProfileService,
    private activityService: ActivityService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rawUserId = this.route.snapshot.paramMap.get('userId');
    if (!rawUserId) {
      this.error = "Aucun identifiant d'utilisateur spécifié.";
      return;
    }
    const userId = decodeURIComponent(rawUserId);
    this.loadProfile(userId);
    this.loadActivityInfo(userId);
  }

  loadProfile(userId: string): void {
    this.isLoading = true;
    this.profileService.getProfileByUserId(userId).subscribe({
      next: (data: Profile) => {
        this.profile = data;
        if (this.profile.photo && this.profile.photo.startsWith('blob:')) {
          this.profile.photo = '';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du profil utilisateur', err);
        this.error = 'Impossible de charger le profil de l’utilisateur.';
        this.isLoading = false;
      }
    });
  }

  loadActivityInfo(email: string): void {
    this.isLoadingActivity = true;
    this.activityService.getUserActivityInfo(email).subscribe({
      next: (data) => {
        this.activityInfo = data;
        this.isLoadingActivity = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l’activité utilisateur', err);
        this.activityInfo = null;
        this.isLoadingActivity = false;
      }
    });
  }

  formatDateTime(value?: string): string {
    if (!value) {
      return 'Non disponible';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Non disponible';
    }
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get userInitials(): string {
    if (this.profile.prenom && this.profile.nomProprietaire) {
      return `${this.profile.prenom.charAt(0)}${this.profile.nomProprietaire.charAt(0)}`.toUpperCase();
    }
    if (this.profile.nomProprietaire) {
      return this.profile.nomProprietaire.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getPlaceholderImage(): string {
    const initials = this.userInitials;
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#CC0000"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" fill="white">${initials}</text></svg>`)}`;
  }

  onImageError(event: any): void {
    this.profile.photo = '';
    if (event && event.target) {
      event.target.src = this.getPlaceholderImage();
    }
  }
}
