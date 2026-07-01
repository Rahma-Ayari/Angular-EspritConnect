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

interface SectionDef {
  key: keyof DigestSectionsDTO;
  label: string;
  desc: string;
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
    frontendBaseUrl: 'http://localhost:4200',
    mailingListId: undefined
  };

  // ── Listes de diffusion ──
  mailingLists: any[] = [];

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

  ngOnInit(): void {
    // 1. Lire la config
    this.digestService.getConfig().subscribe({
      next: (dto: DigestConfigResponseDTO) => this.applyDTO(dto),
      error: (err) => {
        console.warn('Config non trouvée, utilisation des valeurs par défaut', err);
      }
    });

    // 2. Récupérer les listes de diffusion
    this.digestService.getMailingLists().subscribe({
      next: (lists) => {
        this.mailingLists = lists;
      },
      error: (err) => {
        console.warn('Impossible de charger les listes de diffusion. Mode démo activé.', err);
        this.mailingLists = [
          { id: 1, name: 'Students Group' },
          { id: 2, name: 'Teacher/Staff Group' },
          { id: 3, name: 'All Alumni' },
          { id: 4, name: 'All Users' }
        ];
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
      mailingListId:  dto.mailingListId,
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

    const dto: DigestConfigRequestDTO = {
      sujet:          this.config.sujet,
      bannerUrl:      this.config.bannerUrl,
      frequence:      this.config.frequence,
      actif:          this.config.actif,
      templateHtml:   this.config.templateHtml,
      sections:       this.config.sections,
      frontendBaseUrl: this.config.frontendBaseUrl,
      mailingListId:  this.config.mailingListId ? Number(this.config.mailingListId) : undefined
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
    if (!this.config.mailingListId) {
      this.showError("Veuillez d'abord sélectionner une liste de diffusion destinataire.");
      return;
    }

    const selectedListName = this.mailingLists.find(l => l.id == this.config.mailingListId)?.name || 'la liste sélectionnée';

    if (!confirm(`Envoyer le digest maintenant aux membres de "${selectedListName}" ?`)) return;
    
    this.sending = true;
    this.clearMessages();

    // 1. Sauvegarder d'abord la configuration actuelle pour s'assurer que le backend utilise la bonne liste de diffusion
    const dto: DigestConfigRequestDTO = {
      sujet:          this.config.sujet,
      bannerUrl:      this.config.bannerUrl,
      frequence:      this.config.frequence,
      actif:          this.config.actif,
      templateHtml:   this.config.templateHtml,
      sections:       this.config.sections,
      frontendBaseUrl: this.config.frontendBaseUrl,
      mailingListId:  this.config.mailingListId ? Number(this.config.mailingListId) : undefined
    };

    this.digestService.updateConfig(dto).subscribe({
      next: (res) => {
        this.applyDTO(res);
        
        // 2. Lancer l'envoi du digest
        this.digestService.sendDigestNow().subscribe({
          next: () => {
            this.sending = false;
            this.showSuccess(`Digest envoyé avec succès aux membres de "${selectedListName}" !`);
            this.digestService.getConfig().subscribe(dto => this.applyDTO(dto));
          },
          error: (err) => {
            console.error(err);
            this.sending = false;
            // Récupère le message d'erreur du serveur s'il existe
            const serverError = err.error?.message || err.error || "";
            this.showError("Erreur lors de l'envoi : " + (serverError ? serverError : "Veuillez vérifier votre configuration de serveur SMTP (Gmail App Password) dans application.properties."));
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.sending = false;
        this.showError("Erreur lors de l'enregistrement automatique de la configuration avant l'envoi.");
      }
    });
  }

  // ── Réinitialiser le template ──
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
        this.config.mailingListId = undefined;
        this.showSuccess('Template vidé.');
      },
      error: () => this.showError('Erreur lors du vidage.')
    });
  }

  // ── Charger l'aperçu ──
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
        const backendMessage =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : '');
        this.showError(
          backendMessage
            ? `Impossible de générer l'aperçu : ${backendMessage}`
            : "Impossible de générer l'aperçu. Vérifiez les logs backend."
        );
      }
    });
  }

  // ── Upload bannière ──
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
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Fichier trop lourd (max 5 Mo).');
      return;
    }

    this.digestService.uploadBanner(file).subscribe({
      next: (res) => {
        this.config.bannerUrl = res.url;
        this.showSuccess('Bannière uploadée avec succès !');
      },
      error: () => {
        // Fallback local preview if upload fails
        const reader = new FileReader();
        reader.onload = (e) => {
          this.config.bannerUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        this.showSuccess('Bannière chargée en local (mode démo).');
      }
    });
  }

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

  setDevice(device: 'desktop' | 'mobile'): void {
    this.previewDevice = device;
    this.adjustIframeHeight();
  }

  adjustIframeHeight(): void {
    setTimeout(() => {
      const iframe = document.querySelector('.preview-frame') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          const doc = iframe.contentWindow.document;
          if (this.previewDevice === 'desktop') {
            const height = Math.max(
              doc.body.scrollHeight,
              doc.documentElement.scrollHeight,
              doc.body.offsetHeight,
              doc.documentElement.offsetHeight
            );
            iframe.style.height = (height + 20) + 'px';
          } else {
            iframe.style.height = '667px'; // Mobile viewport height
          }
        } catch (e) {
          console.warn('Erreur lors de l\'ajustement de la hauteur de l\'iframe :', e);
        }
      }
    }, 50);
  }
}