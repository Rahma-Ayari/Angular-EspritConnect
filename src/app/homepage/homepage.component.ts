import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AuthService } from '../auth.service';
import {
  FEATURE_ICONS,
  HOMEPAGE_I18N,
  HomepageCopy,
  HomepageLang,
  STAT_ICONS
} from './homepage.i18n';

interface StatCard {
  target: number;
  suffix: string;
  display: string;
  icon: string;
  formatThousands?: boolean;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('statValue') statValueRefs!: QueryList<ElementRef<HTMLElement>>;

  lang: HomepageLang = 'en';
  readonly featureIcons = FEATURE_ICONS;
  readonly statIcons = STAT_ICONS;

  readonly statTargets: Omit<StatCard, 'display'>[] = [
    { target: 15000, suffix: '+', icon: STAT_ICONS[0], formatThousands: true },
    { target: 60, suffix: '+', icon: STAT_ICONS[1] },
    { target: 120, suffix: '+', icon: STAT_ICONS[2] },
    { target: 94, suffix: '%', icon: STAT_ICONS[3] },
    { target: 25, suffix: '+', icon: STAT_ICONS[4] }
  ];

  statDisplays: string[] = ['0', '0', '0', '0%', '0'];

  readonly corporatePartners = [
    'MICROSOFT', 'AIRBUS', 'ORANGE', 'IBM', 'TELNET', 'VERMEG',
    'SOFTHEALTH', 'STE', 'FOCAL', 'PROXYM', 'AXA', 'ATB'
  ];

  readonly academicPartners = [
    'BORDEAUX', 'INSA LYON', 'POLYTECHNIQUE', 'HEC PARIS', 'EPITA',
    'ECE', 'ESIGELEC', 'UTT', 'UTC', 'ENSEEIHT', 'TELECOM', 'CENTRALE'
  ];

  activeTestimonial = 0;

  private observer?: IntersectionObserver;
  private animated = false;

  constructor(private authService: AuthService) {}

  get t(): HomepageCopy {
    return HOMEPAGE_I18N[this.lang];
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('esprit-lang') as HomepageLang | null;
    if (saved === 'en' || saved === 'fr') {
      this.lang = saved;
    }
    document.documentElement.lang = this.lang;

    if (this.authService.isLoggedIn()) {
      this.authService.redirectAfterLogin(this.authService.getRole()!);
    }
  }

  setLanguage(lang: HomepageLang): void {
    if (this.lang === lang) {
      return;
    }
    this.lang = lang;
    localStorage.setItem('esprit-lang', lang);
    document.documentElement.lang = lang;
  }

  ngAfterViewInit(): void {
    const section = document.getElementById('numbers');
    if (!section) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !this.animated) {
          this.animated = true;
          this.animateCounters();
        }
      },
      { threshold: 0.25 }
    );

    this.observer.observe(section);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  selectTestimonial(index: number): void {
    this.activeTestimonial = index;
  }

  prevTestimonial(): void {
    this.activeTestimonial =
      (this.activeTestimonial - 1 + this.t.testimonials.length) % this.t.testimonials.length;
  }

  nextTestimonial(): void {
    this.activeTestimonial = (this.activeTestimonial + 1) % this.t.testimonials.length;
  }

  private animateCounters(): void {
    const duration = 2000;
    const start = performance.now();
    const locale = this.lang === 'fr' ? 'fr-FR' : 'en-US';

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.statTargets.forEach((stat, index) => {
        const current = Math.round(stat.target * eased);
        const display = this.formatStatValue(current, stat, locale);
        this.statDisplays[index] = display;
        const el = this.statValueRefs.get(index)?.nativeElement;
        if (el) {
          el.textContent = display;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  private formatStatValue(
    value: number,
    stat: Omit<StatCard, 'display'>,
    locale: string
  ): string {
    if (stat.suffix === '%') {
      return `${value}%`;
    }
    if (stat.formatThousands) {
      return value.toLocaleString(locale).replace(/\u00a0/g, ' ') + stat.suffix;
    }
    return `${value}${stat.suffix}`;
  }
}
