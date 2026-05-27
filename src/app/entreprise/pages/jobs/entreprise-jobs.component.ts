import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import {
  CandidateMatch,
  EntrepriseJobDashboardOverview,
  EntrepriseVerification,
  OffreAiSuggestion
} from '../../../models/job-dashboard.model';
import { Offre, OffreType } from '../../../models/offre.model';
import { EntrepriseJobDashboardService } from '../../../services/entreprise-job-dashboard.service';

type TabId = 'overview' | 'offers';
type AiTab = 'chat' | 'questions' | 'filieres' | 'titles';

@Component({
  selector: 'app-entreprise-jobs',
  templateUrl: './entreprise-jobs.component.html',
  styleUrls: ['./entreprise-jobs.component.css']
})
export class EntrepriseJobsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly entrepriseId = environment.devEntrepriseId;

  activeTab: TabId = 'overview';
  loading = true;
  saving = false;
  aiLoading = false;
  error = '';
  success = '';

  overview: EntrepriseJobDashboardOverview | null = null;
  verification: EntrepriseVerification | null = null;
  jobs: Offre[] = [];
  selectedJob: Offre | null = null;
  candidates: CandidateMatch[] = [];
  candidatesLoading = false;

  showOfferForm = false;
  editingId: number | null = null;
  skillsInput = '';
  aiSuggestion: OffreAiSuggestion | null = null;

  jobForm!: FormGroup;

  // AI Agent States
  aiAgentBubbleText = 'Bonjour ! Je suis votre assistant de recrutement IA. Remplissez les champs à gauche et je vous aiderai à optimiser votre offre d\'emploi.';
  aiTitleSuggestions: string[] = [];
  aiInterviewQuestions: string[] = [];
  aiFiliereRecommendations: { code: string; label: string; reason: string }[] = [];
  aiAgentActiveTab: AiTab = 'chat';

  readonly typeOptions: { value: OffreType; label: string }[] = [
    { value: 'STAGE', label: 'Stage' },
    { value: 'EMPLOI', label: 'Emploi' },
    { value: 'APPRENTISSAGE', label: 'Apprentissage' }
  ];

  constructor(
    private fb: FormBuilder,
    private dashboard: EntrepriseJobDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.jobForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(30)]],
      typeOffre: ['STAGE' as OffreType, Validators.required],
      domaine: ['', Validators.required],
      localisation: [''],
      briefNotes: ['']
    });
    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canPostOffers(): boolean {
    return !!this.verification?.canPostOffers;
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.dashboard.getOverview(this.entrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.overview = data;
          this.verification = data.verification;
          this.loadJobs();
        },
        error: () => {
          this.error = 'Impossible de charger les statistiques du tableau de bord. La gestion des offres reste disponible.';
          this.overview = null;
          this.verification = {
            entrepriseId: this.entrepriseId,
            entrepriseNom: 'Entreprise',
            verificationStatus: 'VERIFIED',
            documentsCount: 0,
            canPostOffers: true,
            documents: []
          };
          this.loadJobs();
        }
      });
  }

  loadJobs(): void {
    this.dashboard.listOffers(this.entrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobs) => {
          this.jobs = jobs;
          this.loading = false;
          if (this.selectedJob) {
            this.selectedJob = jobs.find(j => j.idOffre === this.selectedJob?.idOffre) ?? null;
          }
        },
        error: () => {
          this.jobs = [];
          this.loading = false;
        }
      });
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
    this.success = '';
    this.error = '';
  }

  setAiTab(tab: AiTab): void {
    this.aiAgentActiveTab = tab;
  }

  goToProfileVerification(): void {
    this.router.navigate(['/admin/entreprise/profile'], { queryParams: { section: 'verification' } });
  }

  openCreateOffer(): void {
    if (!this.canPostOffers) {
      this.goToProfileVerification();
      return;
    }
    this.editingId = null;
    this.showOfferForm = true;
    this.aiSuggestion = null;
    this.skillsInput = '';
    this.jobForm.reset({ typeOffre: 'STAGE', domaine: '', localisation: '', briefNotes: '' });
    
    // Reset AI Agent Panel
    this.aiAgentBubbleText = 'Bonjour ! Commençons par saisir le titre et le domaine du poste à gauche.';
    this.aiTitleSuggestions = [];
    this.aiInterviewQuestions = [];
    this.aiFiliereRecommendations = [];
    this.aiAgentActiveTab = 'chat';
  }

  openEditOffer(job: Offre): void {
    if (!job.idOffre) return;
    this.editingId = job.idOffre;
    this.showOfferForm = true;
    this.skillsInput = (job.competencesRequises ?? []).join(', ');
    this.jobForm.patchValue({
      titre: job.titre,
      description: job.description,
      typeOffre: job.typeOffre,
      domaine: job.domaine ?? '',
      localisation: job.localisation ?? ''
    });

    // Reset AI Agent Panel
    this.aiAgentBubbleText = 'Vous modifiez une offre existante. Je suis là pour vous aider à la peaufiner.';
    this.aiTitleSuggestions = [];
    this.aiInterviewQuestions = [];
    this.aiFiliereRecommendations = [];
    this.aiAgentActiveTab = 'chat';
  }

  cancelOfferForm(): void {
    this.showOfferForm = false;
    this.editingId = null;
    this.aiSuggestion = null;
  }

  // ── AI AGENT HELPERS ───────────────────────────────────────────────────────

  runAiAssist(): void {
    const v = this.jobForm.value;
    if (!v.titre || !v.domaine) {
      this.aiAgentBubbleText = '⚠️ Saisissez au moins un titre et un domaine à gauche pour que je puisse générer une description précise !';
      return;
    }

    this.aiLoading = true;
    this.aiAgentBubbleText = 'Je analyse vos critères et rédige la description idéale...';

    this.dashboard.aiSuggest({
      titre: v.titre,
      typeOffre: v.typeOffre,
      domaine: v.domaine,
      localisation: v.localisation,
      briefNotes: v.briefNotes
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => {
        this.aiSuggestion = s;
        this.aiLoading = false;
        this.aiAgentBubbleText = '✨ C\'est fait ! J\'ai rédigé une proposition de fiche de poste et extrait les compétences clés. Cliquez sur "Appliquer" ci-dessous pour les copier dans le formulaire.';
        
        // Auto-run interview questions and course recommendations in background
        this.generateQuestionsOffline(v.titre, s.suggestedSkills);
        this.generateFilieresOffline(v.titre, v.domaine, s.suggestedSkills);
      },
      error: () => {
        this.aiLoading = false;
        this.error = 'Assistant IA indisponible.';
        this.aiAgentBubbleText = 'Désolé, je rencontre des difficultés à me connecter au service de génération.';
      }
    });
  }

  applyAiSuggestion(): void {
    if (!this.aiSuggestion) return;
    this.jobForm.patchValue({ description: this.aiSuggestion.suggestedDescription });
    this.skillsInput = this.aiSuggestion.suggestedSkills.join(', ');
    this.aiAgentBubbleText = 'Description et compétences appliquées avec succès ! Vous pouvez à présent relire et personnaliser la description.';
  }

  clearAiSuggestion(): void {
    this.aiSuggestion = null;
    this.aiAgentBubbleText = 'Entendu, j\'ai ignoré cette suggestion. N\'hésitez pas à relancer la génération si besoin.';
  }

  runAiTitleOptimizer(): void {
    const titre = this.jobForm.get('titre')?.value;
    if (!titre) {
      this.aiAgentBubbleText = '⚠️ Saisissez d\'abord un titre simple dans le formulaire (ex. "dev") pour obtenir des variantes.';
      this.aiAgentActiveTab = 'chat';
      return;
    }

    this.aiAgentActiveTab = 'titles';
    const lower = titre.toLowerCase();
    
    if (lower.includes('dev') || lower.includes('web') || lower.includes('software') || lower.includes('logiciel')) {
      this.aiTitleSuggestions = [
        `Développeur Full-Stack (Java / Angular)`,
        `Ingénieur d'Études et Développement Web`,
        `Développeur Front-End (Angular / TypeScript) - H/F`,
        `Ingénieur Concepteur Développeur Logiciel`
      ];
    } else if (lower.includes('data') || lower.includes('python') || lower.includes('ia') || lower.includes('intelligence')) {
      this.aiTitleSuggestions = [
        `Data Scientist & ML Engineer`,
        `Ingénieur Analyste de Données / BI`,
        `Data Engineer (Python / SQL / Spark)`,
        `Consultant Data & Analytics`
      ];
    } else if (lower.includes('reseau') || lower.includes('network') || lower.includes('sys') || lower.includes('cloud') || lower.includes('admin')) {
      this.aiTitleSuggestions = [
        `Administrateur Systèmes, Réseaux et Cloud`,
        `Ingénieur DevOps & Cloud Computing`,
        `Consultant en Cybersécurité et Réseaux`,
        `Architecte Infrastructure Cloud (AWS/Azure)`
      ];
    } else {
      this.aiTitleSuggestions = [
        `Stagiaire ${titre} (H/F)`,
        `Ingénieur ${titre} Junior`,
        `Consultant ${titre} - Département Innovation`,
        `Assistant ${titre} (Alternance/Apprentissage)`
      ];
    }

    this.aiAgentBubbleText = 'Voici des titres plus professionnels et percutants pour attirer les meilleurs profils étudiants d\'ESPRIT. Cliquez sur l\'un d\'eux pour l\'adopter.';
  }

  applyTitleSuggestion(title: string): void {
    this.jobForm.patchValue({ titre: title });
    this.aiAgentBubbleText = `Parfait, le titre a été mis à jour par : "${title}".`;
    this.aiAgentActiveTab = 'chat';
  }

  runAiInterviewQuestions(): void {
    const titre = this.jobForm.get('titre')?.value || 'ce poste';
    const skills = this.skillsInput ? this.skillsInput.split(',').map(s => s.trim()) : [];
    
    this.aiAgentActiveTab = 'questions';
    this.generateQuestionsOffline(titre, skills);
  }

  private generateQuestionsOffline(titre: string, skills: string[]): void {
    const lower = titre.toLowerCase();
    const skillsString = skills.join(' ');

    if (lower.includes('dev') || lower.includes('web') || skillsString.includes('Angular') || skillsString.includes('React') || skillsString.includes('Java')) {
      this.aiInterviewQuestions = [
        "Quelle est la différence fondamentale entre les Promises et les Observables (RxJS) ? Donnez un cas d'usage.",
        "Comment gérez-vous la sécurité des données et les attaques courantes (CSRF, XSS) dans une application Web ?",
        "Expliquez le concept d'Injection de Dépendances dans Spring Boot ou Angular et pourquoi il est recommandé.",
        "Décrivez une situation où vous avez dû optimiser les performances d'une base de données ou d'une requête API lente."
      ];
    } else if (lower.includes('data') || lower.includes('python') || skillsString.includes('Python') || skillsString.includes('SQL')) {
      this.aiInterviewQuestions = [
        "Quelle est la différence entre l'apprentissage supervisé et non supervisé ? Illustrez avec des exemples concrets.",
        "Comment traitez-vous les valeurs manquantes ou aberrantes dans un jeu de données avant de l'analyser ?",
        "Expliquez le fonctionnement des jointures SQL complexes (Inner, Left, Outer) et comment optimiser les index.",
        "Décrivez votre expérience avec les frameworks de Deep Learning (TensorFlow, PyTorch) ou les outils de BI."
      ];
    } else {
      this.aiInterviewQuestions = [
        "Parlez-moi d'un défi technique complexe que vous avez surmonté récemment. Quel a été votre rôle exact ?",
        "Comment vous y prenez-vous pour concevoir l'architecture d'une nouvelle fonctionnalité à partir de zéro ?",
        "Quels outils de Git et workflows (GitFlow, Pull Requests, Rebase) utilisez-vous pour collaborer en équipe ?",
        "Comment restez-vous à jour techniquement ? Citez des blogs, newsletters ou technos que vous suivez activement."
      ];
    }

    this.aiAgentBubbleText = `J'ai préparé 4 questions techniques et comportementales adaptées au profil recherché pour vous guider lors des entretiens.`;
  }

  runAiFiliereRecommendations(): void {
    const titre = this.jobForm.get('titre')?.value || '';
    const domaine = this.jobForm.get('domaine')?.value || '';
    const skills = this.skillsInput ? this.skillsInput.split(',').map(s => s.trim()) : [];

    this.aiAgentActiveTab = 'filieres';
    this.generateFilieresOffline(titre, domaine, skills);
  }

  private generateFilieresOffline(titre: string, domaine: string, skills: string[]): void {
    const query = (titre + ' ' + domaine + ' ' + skills.join(' ')).toLowerCase();
    
    const recs: { code: string; label: string; reason: string }[] = [];

    if (query.includes('dev') || query.includes('web') || query.includes('software') || query.includes('logiciel') || query.includes('angular') || query.includes('react') || query.includes('java') || query.includes('spring')) {
      recs.push({
        code: 'TWIN',
        label: 'Technologies Web & Mobile',
        reason: 'Spécialisés dans le développement d\'applications web complexes, l\'architecture cloud et les écosystèmes JS/Java.'
      });
      recs.push({
        code: 'GL',
        label: 'Génie Logiciel',
        reason: 'Profils orientés modélisation, architecture logicielle robuste, méthodologies agiles et assurance qualité.'
      });
    }
    
    if (query.includes('mobile') || query.includes('android') || query.includes('ios') || query.includes('flutter')) {
      recs.push({
        code: 'TWIN',
        label: 'Technologies Web & Mobile',
        reason: 'Excellente maîtrise du développement natif (Swift/Kotlin) et multiplateforme (Flutter/React Native).'
      });
    }

    if (query.includes('data') || query.includes('python') || query.includes('ia') || query.includes('ml') || query.includes('machine') || query.includes('analytics') || query.includes('bi')) {
      recs.push({
        code: 'DS',
        label: 'Data Science',
        reason: 'Compétences fortes en analyse statistique, modélisation mathématique, Machine Learning et Big Data (Spark, Python).'
      });
      recs.push({
        code: 'BI',
        label: 'Business Intelligence',
        reason: 'Profils experts en modélisation de données décisionnelles, entrepôts de données, ETL et outils de Dataviz.'
      });
    }

    if (query.includes('security') || query.includes('cyber') || query.includes('reseau') || query.includes('network') || query.includes('cloud') || query.includes('devops')) {
      recs.push({
        code: 'SE',
        label: 'Sécurité et Systèmes',
        reason: 'Formation poussée sur la sécurité des infrastructures, tests de pénétration, virtualisation et administration Unix/Windows.'
      });
      recs.push({
        code: 'NTS',
        label: 'Réseaux et Télécoms',
        reason: 'Compétences solides en conception de réseaux, routage, protocoles de communication et architectures cloud hybrides.'
      });
    }

    // Default recommendation if empty
    if (recs.length === 0) {
      recs.push({
        code: 'GL',
        label: 'Génie Logiciel (Tronc commun)',
        reason: 'Ingénieurs polyvalents maîtrisant les bases de l\'algorithmique, des bases de données et de la gestion de projet.'
      });
    }

    this.aiFiliereRecommendations = recs;
    this.aiAgentBubbleText = `Voici les spécialités d'ESPRIT dont les programmes pédagogiques correspondent le mieux à votre offre.`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
    this.aiAgentBubbleText = 'Contenu copié dans le presse-papiers !';
  }

  // ── BACKEND PERSISTENCE ───────────────────────────────────────────────────

  saveOffer(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }
    const v = this.jobForm.value;
    const skills = this.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const body = {
      titre: v.titre,
      description: v.description,
      typeOffre: v.typeOffre,
      localisation: v.localisation || undefined,
      domaine: v.domaine,
      competencesRequises: skills,
      entrepriseId: this.entrepriseId
    };

    this.saving = true;
    const req = this.editingId
      ? this.dashboard.updateOffer(this.editingId, body)
      : this.dashboard.createOffer(body);

    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false;
        this.success = this.editingId ? 'Offre mise à jour avec succès.' : 'Offre publiée avec succès.';
        this.cancelOfferForm();
        this.refresh();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Publication impossible. Vérifiez que votre entreprise est validée.';
      }
    });
  }

  deleteOffer(job: Offre): void {
    if (!job.idOffre || !confirm('Supprimer cette offre d\'emploi définitivement ?')) return;
    this.dashboard.deleteOffer(job.idOffre)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.selectedJob?.idOffre === job.idOffre) {
            this.selectedJob = null;
            this.candidates = [];
          }
          this.refresh();
        },
        error: () => { this.error = 'Suppression impossible.'; }
      });
  }

  selectJob(job: Offre): void {
    this.selectedJob = job;
    if (!job.idOffre) return;
    this.candidatesLoading = true;
    this.dashboard.topCandidates(job.idOffre, 8)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.candidates = list;
          this.candidatesLoading = false;
        },
        error: () => {
          this.candidates = [];
          this.candidatesLoading = false;
        }
      });
  }

  openStudentView(job: Offre): void {
    if (!job.idOffre) return;
    window.open(`/jobs/${job.idOffre}`, '_blank');
  }

  typeLabel(t: string): string {
    return this.typeOptions.find(o => o.value === t)?.label ?? t;
  }

  scoreColor(score: number): string {
    if (score >= 75) return 'high';
    if (score >= 50) return 'mid';
    return 'low';
  }

  verificationLabel(status?: string): string {
    switch (status) {
      case 'VERIFIED': return 'Vérifiée';
      case 'PENDING_REVIEW': return 'En revue admin';
      case 'REJECTED': return 'Refusée';
      default: return 'Documents requis';
    }
  }

  verificationClass(status?: string): string {
    switch (status) {
      case 'VERIFIED': return 'pill-success';
      case 'PENDING_REVIEW': return 'pill-warn';
      case 'REJECTED': return 'pill-danger';
      default: return 'pill-neutral';
    }
  }
}
