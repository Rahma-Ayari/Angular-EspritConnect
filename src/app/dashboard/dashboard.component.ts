import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthResponse, AuthService } from '../auth.service';

export interface StatCard {
  icon: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface Opportunity {
  company: string;
  role: string;
  type: string;
  location: string;
  match: number;
  logo: string;
  posted: string;
  tags: string[];
}

export interface Event {
  title: string;
  date: string;
  type: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  user: AuthResponse | null = null;
  greeting = '';
  currentTime = '';
  sidebarOpen = true;
  activeNav = 'dashboard';

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

  readinessScore = 72;
  readinessTasks = [
    { label: 'Ajouter vos projets portfolio',  gain: 12, done: false },
    { label: 'Compléter évaluation de compétences', gain: 8,  done: false },
    { label: 'Obtenir 2 recommandations de plus', gain: 6,  done: false }
  ];

  stats: StatCard[] = [
    { icon: 'bi-briefcase',    label: 'Candidatures',  value: '8',   delta: '+2 ce mois', trend: 'up',     color: '#CC0000' },
    { icon: 'bi-eye',          label: 'Vues profil',   value: '134', delta: '+18%',        trend: 'up',     color: '#7C3AED' },
    { icon: 'bi-patch-check',  label: 'Compétences',   value: '12',  delta: '+3 nouvelles', trend: 'up',   color: '#059669' },
    { icon: 'bi-people',       label: 'Connexions',    value: '47',  delta: '+5 semaine',  trend: 'up',     color: '#D97706' }
  ];

  opportunities: Opportunity[] = [
    {
      company: 'TechCorp', role: 'Full Stack Developer', type: 'Emploi',
      location: 'Tunis', match: 92,
      logo: 'TC', posted: 'Il y a 2j',
      tags: ['React', 'Spring Boot', 'AWS']
    },
    {
      company: 'StartupX', role: 'UX Designer Intern', type: 'Stage',
      location: 'Lac I', match: 85,
      logo: 'SX', posted: 'Il y a 1j',
      tags: ['Figma', 'UX Research']
    },
    {
      company: 'AI Labs', role: 'Data Scientist', type: 'Emploi',
      location: 'Remote', match: 78,
      logo: 'AI', posted: 'Aujourd\'hui',
      tags: ['Python', 'TensorFlow', 'SQL']
    },
    {
      company: 'Sofrecom', role: 'DevOps Engineer', type: 'Stage',
      location: 'Ariana', match: 74,
      logo: 'SF', posted: 'Il y a 3j',
      tags: ['Docker', 'Kubernetes', 'CI/CD']
    }
  ];

  upcomingEvents: Event[] = [
    { title: 'Career Fair 2026',  date: 'Mai 5',  type: 'CAREER_FAIR', icon: 'bi-building' },
    { title: 'Tech Workshop',     date: 'Mai 8',  type: 'WORKSHOP',    icon: 'bi-laptop' },
    { title: 'Hackathon Esprit',  date: 'Mai 15', type: 'HACKATHON',   icon: 'bi-code-slash' }
  ];

  navItems = [
    { id: 'dashboard',     label: 'Dashboard',   icon: 'bi-house' },
    { id: 'opportunities', label: 'Opportunités', icon: 'bi-briefcase' },
    { id: 'network',       label: 'Réseau',       icon: 'bi-people' },
    { id: 'mentorship',    label: 'Mentoring',    icon: 'bi-mortarboard' },
    { id: 'events',        label: 'Événements',   icon: 'bi-calendar-event' },
    { id: 'messages',      label: 'Messages',     icon: 'bi-chat' },
    { id: 'profile',       label: 'Profil',       icon: 'bi-person' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      if (user) {
        this.readinessScore = user.scoreReadiness || 72;
        this.loadMfaStatus();
      }
    });
    this.setGreeting();
    this.updateTime();
    setInterval(() => this.updateTime(), 60_000);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  }

  private updateTime(): void {
    this.currentTime = new Date().toLocaleTimeString('fr-TN', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  get circumference(): number { return 2 * Math.PI * 54; }

  get strokeDashoffset(): number {
    return this.circumference - (this.readinessScore / 100) * this.circumference;
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }

  setNav(id: string): void { this.activeNav = id; }

  logout(): void { this.authService.logout(); }

  get userInitials(): string {
    if (!this.user?.nom) return '?';
    return this.user.nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getMatchColor(score: number): string {
    if (score >= 90) return '#059669';
    if (score >= 75) return '#D97706';
    return '#CC0000';
  }
}
