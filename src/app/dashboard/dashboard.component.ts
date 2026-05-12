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
      if (user) this.readinessScore = user.scoreReadiness || 72;
    });
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
