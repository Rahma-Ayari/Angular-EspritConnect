import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthResponse, AuthService } from '../auth.service';
import { EntrepriseJobDashboardService } from '../services/entreprise-job-dashboard.service';
import { JobsBackofficeService } from '../services/jobs-backoffice.service';
import { OffreType } from '../models/offre.model';

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
  activeNav = 'dashboard';
  readonly devEntrepriseId = 1;
  isEntreprise = false;
  jobsLoading = false;
  jobsError = '';
  jobsSuccess = '';
  myOffers: any[] = [];

  aiPrompt = '';
  aiGenerating = false;
  aiSuggestion = '';

  offerDraft = {
    titre: '',
    typeOffre: 'STAGE' as OffreType,
    domaine: '',
    localisation: '',
    description: '',
    competences: ''
  };

  employmentTypes: string[] = ['Full-time', 'Part-time', 'Internship'];

  readinessScore = 72;
  readinessTasks = [
    { label: 'Add portfolio projects', gain: 12, done: false },
    { label: 'Complete skills assessment', gain: 8, done: false },
    { label: 'Get 2 more recommendations', gain: 6, done: false }
  ];

  stats: StatCard[] = [
    { icon: 'bi-briefcase',    label: 'Applications', value: '8',   delta: '+2 this month', trend: 'up', color: '#CC0000' },
    { icon: 'bi-eye',          label: 'Profile views', value: '134', delta: '+18%',       trend: 'up', color: '#7C3AED' },
    { icon: 'bi-patch-check',  label: 'Skills',        value: '12',  delta: '+3 new',      trend: 'up', color: '#059669' },
    { icon: 'bi-people',       label: 'Connections',   value: '47',  delta: '+5 this week', trend: 'up', color: '#D97706' }
  ];

  opportunities: Opportunity[] = [
    {
      company: 'TechCorp', role: 'Full Stack Developer', type: 'Full-time',
      location: 'Tunis', match: 92,
      logo: 'TC', posted: '2 days ago',
      tags: ['React', 'Spring Boot', 'AWS']
    },
    {
      company: 'StartupX', role: 'UX Designer Intern', type: 'Internship',
      location: 'Lac I', match: 85,
      logo: 'SX', posted: '1 day ago',
      tags: ['Figma', 'UX Research']
    },
    {
      company: 'AI Labs', role: 'Data Scientist', type: 'Full-time',
      location: 'Remote', match: 78,
      logo: 'AI', posted: 'Today',
      tags: ['Python', 'TensorFlow', 'SQL']
    },
    {
      company: 'Sofrecom', role: 'DevOps Engineer', type: 'Internship',
      location: 'Ariana', match: 74,
      logo: 'SF', posted: '3 days ago',
      tags: ['Docker', 'Kubernetes', 'CI/CD']
    }
  ];

  upcomingEvents: Event[] = [
    { title: 'Career Fair 2026',  date: 'May 5',  type: 'CAREER_FAIR', icon: 'bi-building' },
    { title: 'Tech Workshop',     date: 'May 8',  type: 'WORKSHOP',    icon: 'bi-laptop' },
    { title: 'Hackathon Esprit',  date: 'May 15', type: 'HACKATHON',   icon: 'bi-code-slash' }
  ];

  navItems = [
    { id: 'dashboard',     label: 'Dashboard',   icon: 'bi-house' },
    { id: 'opportunities', label: 'Opportunities', icon: 'bi-compass' },
    { id: 'jobs-dashboard', label: 'Jobs', icon: 'bi-briefcase' },
    { id: 'network',       label: 'Network',       icon: 'bi-people' },
    { id: 'mentorship',    label: 'Mentoring',    icon: 'bi-mortarboard' },
    { id: 'events',        label: 'Events',   icon: 'bi-calendar-event' },
    { id: 'messages',      label: 'Messages',     icon: 'bi-chat' },
    { id: 'profile',       label: 'Profile',       icon: 'bi-person' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private entrepriseJobs: EntrepriseJobDashboardService,
    private jobsBackoffice: JobsBackofficeService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      if (user) this.readinessScore = user.scoreReadiness || 72;
      this.isEntreprise = user?.role === 'ENTREPRISE';
      if (this.isEntreprise) {
        this.loadEntrepriseJobs();
      }
    });
    
    this.syncActiveNavFromUrl();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.syncActiveNavFromUrl());
    
    const settings = this.jobsBackoffice.loadSettings();
    this.employmentTypes = settings.employmentTypes.length
      ? settings.employmentTypes
      : this.employmentTypes;
    this.setGreeting();
    this.updateTime();
    setInterval(() => this.updateTime(), 60_000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
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

  get isJobsRoute(): boolean {
    return this.router.url.includes('/dashboard/jobs');
  }

  private syncActiveNavFromUrl(): void {
    const url = this.router.url.split('?')[0];
    if (url.includes('/dashboard/jobs')) {
      this.activeNav = 'jobs-dashboard';
    } else if (url === '/dashboard' || url.endsWith('/dashboard')) {
      this.activeNav = 'dashboard';
    }
  }

  setNav(id: string): void {
    if (id === 'jobs-dashboard') {
      // Navigate to jobs within dashboard
      this.activeNav = 'jobs-dashboard';
      this.router.navigate(['/dashboard/jobs']);
      return;
    }
    
    if (id === 'dashboard') {
      // Navigate back to main dashboard (clear child routes)
      this.activeNav = 'dashboard';
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // For other navigation items, just set active state for now
    this.activeNav = id;
  }

  get visibleNavItems() {
    // Show all nav items - Jobs will be available to all users for now
    return this.navItems;
  }

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

  loadEntrepriseJobs(): void {
    this.jobsLoading = true;
    this.jobsError = '';
    this.entrepriseJobs.listOffers(this.devEntrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (offers) => {
          this.myOffers = offers;
          this.jobsLoading = false;
        },
        error: () => {
          this.jobsError = 'Unable to load your job offers.';
          this.jobsLoading = false;
        }
      });
  }

  generateAiDescription(): void {
    if (!this.offerDraft.titre || !this.offerDraft.domaine) {
      this.jobsError = 'Renseignez au moins le titre et le domaine.';
      return;
    }
    this.aiGenerating = true;
    this.jobsError = '';
    this.entrepriseJobs.aiSuggest({
      titre: this.offerDraft.titre,
      typeOffre: this.offerDraft.typeOffre,
      domaine: this.offerDraft.domaine,
      localisation: this.offerDraft.localisation,
      briefNotes: this.aiPrompt
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.aiSuggestion = res.suggestedDescription;
        this.offerDraft.description = res.suggestedDescription;
        this.offerDraft.competences = res.suggestedSkills.join(', ');
        this.aiGenerating = false;
      },
      error: () => {
        this.jobsError = 'AI assistant unavailable.';
        this.aiGenerating = false;
      }
    });
  }

  publishOffer(): void {
    if (!this.offerDraft.titre || !this.offerDraft.description || !this.offerDraft.domaine) {
      this.jobsError = 'Title, department, and description are required.';
      return;
    }
    this.jobsError = '';
    this.jobsSuccess = '';
    const skills = this.offerDraft.competences
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    this.entrepriseJobs.createOffer({
      titre: this.offerDraft.titre,
      description: this.offerDraft.description,
      typeOffre: this.offerDraft.typeOffre,
      domaine: this.offerDraft.domaine,
      localisation: this.offerDraft.localisation || undefined,
      competencesRequises: skills,
      entrepriseId: this.devEntrepriseId
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.jobsSuccess = 'Job offer published successfully.';
        this.offerDraft = {
          titre: '',
          typeOffre: 'STAGE',
          domaine: '',
          localisation: '',
          description: '',
          competences: ''
        };
        this.aiPrompt = '';
        this.aiSuggestion = '';
        this.loadEntrepriseJobs();
      },
      error: (err) => {
        this.jobsError = err.error?.message || 'Publication impossible.';
      }
    });
  }

  toOffreType(label: string): OffreType {
    const key = label.toLowerCase();
    if (key.includes('part') || key.includes('full') || key.includes('job')) return 'EMPLOI';
    if (key.includes('intern') || key.includes('stage')) return 'STAGE';
    return 'APPRENTISSAGE';
  }
}
