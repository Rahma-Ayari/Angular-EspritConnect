import { Component, OnInit } from '@angular/core';
import { ProfileService, Profile } from '../../../services/profile.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-entreprise-profil',
  templateUrl: './entreprise-profil.component.html',
  styleUrls: ['./entreprise-profil.component.css']
})
export class EntrepriseProfilComponent implements OnInit {
  profile: Profile = {};
  isEditing = false;
  isLoading = true;
  saveMessage = '';
  saveMessageType: 'success' | 'error' | '' = '';
  activeTab: 'overview' | 'details' | 'links' = 'overview';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.profile = data;
        if (this.profile.photo && this.profile.photo.startsWith('blob:')) {
          this.profile.photo = '';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error lors du chargement du profil', err);
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile();
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    // Ensure userId is present for both create and update
    if (!this.profile.userId) {
        this.profile.userId = this.authService.getCurrentUser()?.email;
    }
    if (this.profile.idProfil) {
        this.profileService.updateProfile(this.profile.idProfil, this.profile).subscribe({
            next: (data: Profile) => {
                this.profile = data;
                this.isEditing = false;
                this.isLoading = false;
                this.showSaveMessage('Profil mis à jour avec succès !', 'success');
                setTimeout(() => this.loadProfile(), 500);
            },
            error: (err: any) => {
                console.error('Error updating profile', err);
                this.isLoading = false;
                this.showSaveMessage('Error updating profile', 'error');
            }
        });
    } else {
        this.profileService.createProfile(this.profile).subscribe({
            next: (data: Profile) => {
                this.profile = data;
                this.isEditing = false;
                this.isLoading = false;
                this.showSaveMessage('Profil créé avec succès !', 'success');
                setTimeout(() => this.loadProfile(), 500);
            },
            error: (err: any) => {
                console.error('Error creating profile', err);
                this.isLoading = false;
                this.showSaveMessage('Error creating profile', 'error');
            }
        });
    }
  }

  showSaveMessage(message: string, type: 'success' | 'error'): void {
    this.saveMessage = message;
    this.saveMessageType = type;
    setTimeout(() => {
      this.saveMessage = '';
      this.saveMessageType = '';
    }, 4000);
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get companyInitials(): string {
    const name = this.profile.nomProprietaire || this.currentUser?.nom || 'EN';
    return name.substring(0, 2).toUpperCase();
  }

  get completionPercentage(): number {
    let total = 0;
    let filled = 0;
    const fields = [
      'nomProprietaire', 'prenom', 'telephone', 'adresse', 'ville',
      'pays', 'codePostal', 'registreCommerce', 'secteurActivite',
      'descriptionEntreprise', 'bio', 'lienLinkedIn', 'siteWeb', 'photo'
    ];
    fields.forEach(f => {
      total++;
      if ((this.profile as any)[f]) filled++;
    });
    return Math.round((filled / total) * 100);
  }

  get missingFields(): string[] {
    const fieldLabels: { [key: string]: string } = {
      nomProprietaire: 'Nom de l\'entreprise',
      prenom: 'Nom du responsable',
      telephone: 'Phone',
      adresse: 'Adresse',
      ville: 'Ville',
      pays: 'Pays',
      registreCommerce: 'Registre de commerce',
      secteurActivite: 'Secteur d\'activité',
      descriptionEntreprise: 'Description',
      bio: 'Biographie',
      lienLinkedIn: 'LinkedIn',
      siteWeb: 'Site web',
      photo: 'Photo de profil'
    };
    const missing: string[] = [];
    Object.keys(fieldLabels).forEach(key => {
      if (!(this.profile as any)[key]) {
        missing.push(fieldLabels[key]);
      }
    });
    return missing;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.compressImage(file, 400, 400, 0.7).then((compressedBase64: string) => {
        this.profile.photo = compressedBase64;
      }).catch((err: any) => {
        console.error('Error lors de la compression de l\'image', err);
        // Fallback: use original file as DataURL
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profile.photo = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Compress and resize an image file using a canvas element.
   * Returns a base64 DataURL (JPEG) with reduced size.
   */
  private compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
          // Draw resized image on canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getPlaceholderImage(): string {
    const initials = this.companyInitials;
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <rect width="150" height="150" fill="#CC0000"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" fill="white">${initials}</text>
    </svg>`)}`;
  }

  onImageError(event: any): void {
    this.profile.photo = '';
    if (event && event.target) {
      event.target.src = this.getPlaceholderImage();
    }
  }

  setTab(tab: 'overview' | 'details' | 'links'): void {
    this.activeTab = tab;
  }
}
