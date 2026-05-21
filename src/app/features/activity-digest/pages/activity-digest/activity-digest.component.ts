// ============================================================
// activity-digest.component.ts
// Composant principal : Activity Digest (backOffice Admin)
// ============================================================
import { Component, OnInit } from '@angular/core';
import { DigestConfigService } from '../../services/digest-config.service';
import {
  DigestConfigRequestDTO,
  DigestConfigResponseDTO,
  DigestSectionsDTO
} from '../../models/digest.models';

// ── Interface pour les sections affichées dans les checkboxes ──
interface SectionDef {
  key: keyof DigestSectionsDTO; // clé dans le DTO
  label: string;                 // libellé affiché
  desc: string;                  // description courte
}

@Component({
  selector: 'app-activity-digest',
  templateUrl: './activity-digest.component.html',
  styleUrls: ['./activity-digest.component.css']
})
export class ActivityDigestComponent implements OnInit {

  // ── État de la configuration (liée au formulaire) ──
  config: DigestConfigRequestDTO & { id?: number; lastSentAt?: string } = {
    sujet: "What's new on Esprit",
    bannerUrl: '',
    frequence: 'WEEKLY',
    actif: true,
    templateHtml: '',
    sections: {
      businessDirectoryPosts: false,
      recentlyJoinedMembers: true,
      latestEvents: true,
      latestFeedPosts: true,
      latestJobPosts: true,
      includePlatformContact: true
    },
    frontendBaseUrl: 'http://localhost:4200'
  };

  // ── Définition des sections (pour la liste de checkboxes) ──
  sectionsList: SectionDef[] = [
    { key: 'businessDirectoryPosts', label: 'Business directory posts', desc: 'Publications du répertoire des entreprises' },
    { key: 'recentlyJoinedMembers', label: 'Recently Joined Members', desc: 'Nouveaux membres inscrits récemment' },
    { key: 'latestEvents',           label: 'Latest Events',           desc: 'Derniers événements publiés' },
    { key: 'latestFeedPosts',        label: 'Latest Feed Posts',       desc: 'Derniers posts du fil d\'actualité' },
    { key: 'latestJobPosts',         label: 'Latest Job Posts',        desc: 'Dernières offres d\'emploi et de stage' },
    { key: 'includePlatformContact', label: 'Include platform contact details', desc: 'Afficher les coordonnées de contact dans le pied de page' }
  ];

  // ── États UI ──
  saving        = false;
  sending       = false;
  loadingPreview = false;
  previewHtml   = '';
  previewDevice: 'desktop' | 'mobile' = 'desktop';
  successMsg    = '';
  errorMsg      = '';

  constructor(private digestService: DigestConfigService) {}

  // ── Au chargement du composant → on lit la config depuis l'API ──
  ngOnInit(): void {
    this.digestService.getConfig().subscribe({
      next: (dto: DigestConfigResponseDTO) => this.applyDTO(dto),
      error: (err) => {
        console.warn('Config non trouvée, utilisation des valeurs par défaut', err);
        // Si pas de config en BDD → on laisse les valeurs par défaut
      }
    });
  }

  // ── Applique un DTO reçu de l'API dans le modèle local ──
  private applyDTO(dto: DigestConfigResponseDTO): void {
    this.config = {
      id:             dto.id,
      sujet:          dto.sujet,
      bannerUrl:      dto.bannerUrl || '',
      frequence:      dto.frequence,
      actif:          dto.actif,
      templateHtml:   dto.templateHtml || '',
      frontendBaseUrl: dto.frontendBaseUrl || 'http://localhost:4200',
      sections:       dto.sections || {
        businessDirectoryPosts: false,
        recentlyJoinedMembers: true,
        latestEvents: true,
        latestFeedPosts: true,
        latestJobPosts: true,
        includePlatformContact: true
      },
      lastSentAt:     dto.lastSentAt
    };
  }

  // ── Getter/Setter pour les checkboxes de sections ──
  getSectionValue(key: keyof DigestSectionsDTO): boolean {
    return this.config.sections?.[key] ?? false;
  }

  setSectionValue(key: keyof DigestSectionsDTO, value: boolean): void {
    if (!this.config.sections) {
      this.config.sections = {
        businessDirectoryPosts: false,
        recentlyJoinedMembers: false,
        latestEvents: false,
        latestFeedPosts: false,
        latestJobPosts: false,
        includePlatformContact: false
      };
    }
    (this.config.sections as any)[key] = value;
  }

  // ── Sauvegarder la configuration ──
  saveConfig(): void {
    this.saving = true;
    this.clearMessages();

    // Construction du DTO à envoyer
    const dto: DigestConfigRequestDTO = {
      sujet:          this.config.sujet,
      bannerUrl:      this.config.bannerUrl,
      frequence:      this.config.frequence,
      actif:          this.config.actif,
      templateHtml:   this.config.templateHtml,
      sections:       this.config.sections,
      frontendBaseUrl: this.config.frontendBaseUrl
    };

    this.digestService.updateConfig(dto).subscribe({
      next: (res) => {
        this.applyDTO(res);
        this.saving = false;
        this.showSuccess('Configuration sauvegardée avec succès !');
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.showError('Erreur lors de la sauvegarde. Vérifiez que le backend est lancé.');
      }
    });
  }

  // ── Envoyer le digest immédiatement ──
  sendNow(): void {
    if (!confirm('Envoyer le digest maintenant à tous les utilisateurs actifs ?')) return;
    this.sending = true;
    this.clearMessages();

    this.digestService.sendDigestNow().subscribe({
      next: () => {
        this.sending = false;
        this.showSuccess('Digest envoyé avec succès à tous les utilisateurs !');
        // Recharger la config pour avoir le lastSentAt mis à jour
        this.digestService.getConfig().subscribe(dto => this.applyDTO(dto));
      },
      error: (err) => {
        console.error(err);
        this.sending = false;
        this.showError('Erreur lors de l\'envoi. Vérifiez la configuration email (SMTP).');
      }
    });
  }

  // ── Réinitialiser le template aux valeurs par défaut ──
  resetTemplate(): void {
    if (!confirm('Réinitialiser la configuration aux valeurs par défaut ?')) return;
    this.digestService.resetTemplate().subscribe({
      next: (res) => {
        this.applyDTO(res);
        this.showSuccess('Configuration réinitialisée.');
      },
      error: () => this.showError('Erreur lors de la réinitialisation.')
    });
  }

  // ── Vider le template ──
  clearTemplate(): void {
    if (!confirm('Vider le template HTML ? Cette action est irréversible.')) return;
    this.digestService.clearTemplate().subscribe({
      next: () => {
        this.config.templateHtml = '';
        this.config.sujet = '';
        this.config.bannerUrl = '';
        this.showSuccess('Template vidé.');
      },
      error: () => this.showError('Erreur lors du vidage.')
    });
  }

  // ── Charger l'aperçu de l'email ──
  loadPreview(): void {
    this.loadingPreview = true;
    this.previewHtml = '';

    this.digestService.getPreview().subscribe({
      next: (res) => {
        this.previewHtml = res.html;
        this.loadingPreview = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingPreview = false;
        this.showError('Impossible de générer l\'aperçu. Vérifiez que le backend est lancé.');
      }
    });
  }

  // ── Upload de la bannière ──
  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadBanner(input.files[0]);
  }

  onBannerDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadBanner(file);
    }
  }

  private uploadBanner(file: File): void {
    // Validation : max 5 Mo
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Fichier trop lourd (max 5 Mo).');
      return;
    }

    this.digestService.uploadBanner(file).subscribe({
      next: (res) => {
        this.config.bannerUrl = res.url;
        this.showSuccess('Bannière uploadée !');
      },
      error: () => {
        // En cas d'erreur upload → on affiche une prévisualisation locale
        const reader = new FileReader();
        reader.onload = (e) => {
          this.config.bannerUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ── Helpers messages ──
  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg   = '';
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string): void {
    this.errorMsg   = msg;
    this.successMsg = '';
    setTimeout(() => this.errorMsg = '', 6000);
  }

  private clearMessages(): void {
    this.successMsg = '';
    this.errorMsg   = '';
  }
}