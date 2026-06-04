import { Component, OnInit } from '@angular/core';
import { ProfileService, Profile } from '../services/profile.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile = {};
  isEditing = false;
  isLoading = false;
  saveMessage = '';
  saveMessageType = '';

  // 2FA Properties
  mfaStatus: {twoFactorEnabled: boolean, backupCodesCount: number, mfaApplicable: boolean} | null = null;
  setupData: {secret: string, qrCode: string} | null = null;
  setupCode = '';
  setupError = '';
  backupCodes: string[] = [];
  showBackupCodesModal = false;
  mfaApplicable = false;

  // Disabling 2FA
  showDisableForm = false;
  disablePassword = '';
  disableCode = '';
  disableError = '';

  // Connections History
  loginHistory: any[] = [];
  showAllHistory = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadMfaStatus();
  }

  loadProfile(): void {
    this.isLoading = true;
        this.profileService.getCurrentUserProfile().subscribe({
          next: (data: Profile) => {
            this.profile = data;
            if (this.profile.photo && this.profile.photo.startsWith('blob:')) {
              this.profile.photo = '';
            }
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Erreur lors du chargement du profil', err);
            this.isLoading = false;
          }
        });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile(); // Recharger si on annule
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    console.log('Saving profile:', this.profile);

    const hasPhotoDataUrl = this.profile.photo && this.profile.photo.startsWith('data:image');

    if (this.profile.idProfil) {
      // Update existing profile
      if (hasPhotoDataUrl) {
        this.profileService.updateProfileFormData(this.profile.idProfil, this.profile).subscribe({
          next: (data: Profile) => {
            console.log('Profile updated (with photo) successfully:', data);
            this.profile = data;
            this.isEditing = false;
            this.isLoading = false;
            this.showSaveMessage('Profil mis à jour avec succès!', 'success');
            setTimeout(() => this.loadProfile(), 500);
          },
          error: (err: any) => {
            console.error('Erreur lors de la mise à jour du profil avec photo', err);
            this.isLoading = false;
            this.showSaveMessage('Erreur lors de la mise à jour du profil', 'error');
          }
        });
      } else {
        this.profileService.updateProfile(this.profile.idProfil, this.profile).subscribe({
          next: (data: Profile) => {
            console.log('Profile updated successfully:', data);
            this.profile = data;
            this.isEditing = false;
            this.isLoading = false;
            this.showSaveMessage('Profil mis à jour avec succès!', 'success');
            setTimeout(() => this.loadProfile(), 500);
          },
          error: (err: any) => {
            console.error('Erreur lors de la mise à jour du profil', err);
            this.isLoading = false;
            this.showSaveMessage('Erreur lors de la mise à jour du profil', 'error');
          }
        });
      }
    } else {
      // Create new profile
      this.profile.userId = this.authService.getCurrentUser()?.email;
      console.log('Creating new profile for user:', this.profile.userId);
      if (hasPhotoDataUrl) {
        this.profileService.createProfileFormData(this.profile).subscribe({
          next: (data: Profile) => {
            console.log('Profile created (with photo) successfully:', data);
            this.profile = data;
            this.isEditing = false;
            this.isLoading = false;
            this.showSaveMessage('Profil créé avec succès!', 'success');
            setTimeout(() => this.loadProfile(), 500);
          },
          error: (err: any) => {
            console.error('Erreur lors de la création du profil avec photo', err);
            this.isLoading = false;
            this.showSaveMessage('Erreur lors de la création du profil', 'error');
          }
        });
      } else {
        this.profileService.createProfile(this.profile).subscribe({
          next: (data: Profile) => {
            console.log('Profile created successfully:', data);
            this.profile = data;
            this.isEditing = false;
            this.isLoading = false;
            this.showSaveMessage('Profil créé avec succès!', 'success');
            setTimeout(() => this.loadProfile(), 500);
          },
          error: (err: any) => {
            console.error('Erreur lors de la création du profil', err);
            this.isLoading = false;
            this.showSaveMessage('Erreur lors de la création du profil', 'error');
          }
        });
      }
    }
  }

  showSaveMessage(message: string, type: string): void {
    this.saveMessage = message;
    this.saveMessageType = type;
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  get userInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.nom) return 'U';
    return user.nom.substring(0, 2).toUpperCase();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Enregistrer l'image en tant que chaîne Base64 pour qu'elle soit persistante
        this.profile.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getPlaceholderImage(): string {
    // Use initials as a fallback
    const initials = this.userInitials;
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <rect width="150" height="150" fill="#CC0000"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" fill="white">${initials}</text>
    </svg>`)}`;
  }

  onImageError(event: any): void {
    // Fallback if image fails to load
    console.log('Image failed to load, using fallback');
    this.profile.photo = '';
    if (event && event.target) {
      event.target.src = this.getPlaceholderImage();
    }
  }

  // ── 2FA METHODS ──
  loadMfaStatus(): void {
    this.authService.get2faStatus().subscribe({
      next: (status) => {
        this.mfaStatus = status;
        this.mfaApplicable = status.mfaApplicable;
        if (status.mfaApplicable && status.twoFactorEnabled) {
          this.loadLoginHistory();
        }
      },
      error: (err) => {
        console.error("Erreur de chargement du statut 2FA", err);
      }
    });
  }

  initiate2faSetup(): void {
    this.setupError = '';
    this.setupData = null;
    this.authService.setup2fa().subscribe({
      next: (data) => {
        this.setupData = data;
      },
      error: (err) => {
        this.setupError = "Impossible d'initier l'activation 2FA. Veuillez réessayer.";
      }
    });
  }

  verifyAndEnableMfa(): void {
    if (!this.setupCode) return;
    this.setupError = '';
    this.authService.verifyAndEnable2fa(this.setupCode).subscribe({
      next: (res) => {
        this.backupCodes = res.backupCodes;
        this.showBackupCodesModal = true;
        this.setupData = null;
        this.setupCode = '';
        this.loadMfaStatus();
      },
      error: (err) => {
        this.setupError = err.error?.message || "Code incorrect. Veuillez réessayer.";
      }
    });
  }

  downloadBackupCodes(): void {
    const content = "CODES DE SECOURS ESPRITCONNECT\n" +
                    "Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.\n\n" +
                    this.backupCodes.join("\n") + "\n\nGénéré le : " + new Date().toLocaleString();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'espritconnect-codes-secours.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  closeBackupModal(): void {
    this.showBackupCodesModal = false;
    this.backupCodes = [];
  }

  toggleDisableForm(): void {
    this.showDisableForm = !this.showDisableForm;
    this.disablePassword = '';
    this.disableCode = '';
    this.disableError = '';
  }

  disableMfa(): void {
    if (!this.disablePassword || !this.disableCode) return;
    this.disableError = '';
    this.authService.disable2fa(this.disablePassword, this.disableCode).subscribe({
      next: () => {
        this.showDisableForm = false;
        this.disablePassword = '';
        this.disableCode = '';
        this.loadMfaStatus();
        this.loginHistory = [];
      },
      error: (err) => {
        this.disableError = err.error?.message || "Mot de passe ou code incorrect.";
      }
    });
  }

  loadLoginHistory(): void {
    this.authService.getLoginHistory().subscribe({
      next: (history) => {
        this.loginHistory = history;
      },
      error: (err) => {
        console.error("Erreur de chargement de l'historique de connexions", err);
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'Succès';
      case 'SUCCESS_BACKUP': return 'Succès (Secours)';
      case 'PENDING_2FA': return '2FA Requis';
      case 'FAILED_2FA': return 'Échec 2FA';
      case 'FAILED_PASSWORD': return 'Mot de passe erroné';
      case 'FAILED_DISABLED': return 'Compte désactivé';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    if (status.startsWith('SUCCESS')) return 'status-success';
    if (status === 'PENDING_2FA') return 'status-warning';
    return 'status-error';
  }

  get displayedLoginHistory(): any[] {
    return this.showAllHistory ? this.loginHistory : this.loginHistory.slice(0, 4);
  }

  getHumanReadableActivity(h: any): string {
    const browser = h.browser || 'un navigateur inconnu';
    const os = h.os || 'un système inconnu';
    const location = h.location && h.location !== 'Unknown' && h.location !== 'Localhost' ? ` à ${h.location}` : '';
    const ip = h.ipAddress ? ` (IP : ${h.ipAddress})` : '';

    switch (h.status) {
      case 'SUCCESS':
        return `Connexion réussie depuis ${browser} sur ${os}${location}${ip}.`;
      case 'SUCCESS_BACKUP':
        return `Connexion réussie via code de secours depuis ${browser} sur ${os}${location}${ip}.`;
      case 'PENDING_2FA':
        return `Tentative de connexion en attente de validation double facteur (2FA) depuis ${browser} sur ${os}${location}${ip}.`;
      case 'FAILED_2FA':
        return `Échec de la validation double facteur (2FA) depuis ${browser} sur ${os}${location}${ip}.`;
      case 'FAILED_PASSWORD':
        return `Échec de connexion : mot de passe incorrect saisi depuis ${browser} sur ${os}${location}${ip}.`;
      case 'FAILED_DISABLED':
        return `Tentative de connexion bloquée : le compte est désactivé.${ip}`;
      default:
        return `Activité de connexion (${h.status}) détectée depuis ${browser} sur ${os}${location}${ip}.`;
    }
  }
}
