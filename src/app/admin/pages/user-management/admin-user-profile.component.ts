import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService, Profile } from '../../../services/profile.service';

@Component({
  selector: 'app-admin-user-profile',
  templateUrl: './admin-user-profile.component.html',
  styleUrls: ['../../../profile/profile.component.css']
})
export class AdminUserProfileComponent implements OnInit {
  profile: Profile = {};
  isLoading = false;
  error = '';

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rawUserId = this.route.snapshot.paramMap.get('userId');
    if (!rawUserId) {
      this.error = "Aucun identifiant d'utilisateur spécifié.";
      return;
    }
    // Le paramètre est encodé (l'email contient @), on le décode
    const userId = decodeURIComponent(rawUserId);
    this.loadProfile(userId);
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
