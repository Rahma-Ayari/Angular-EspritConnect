import { Injectable } from '@angular/core';
import { JobOffer } from '../../jobs/models/job.model';
import { MatchBreakdown, StudentProfile } from '../models/student-job.model';

@Injectable({ providedIn: 'root' })
export class MatchScoreService {
  calculate(job: JobOffer, profile: StudentProfile): MatchBreakdown {
    const jobSkills = [
      ...(job.requiredSkills || []),
      ...(job.technologies || [])
    ].map((s) => s.toLowerCase());

    const profileSkills = profile.skills.map((s) => s.toLowerCase());
    const skillMatches = jobSkills.filter((js) =>
      profileSkills.some((ps) => js.includes(ps) || ps.includes(js))
    );
    const skills =
      jobSkills.length === 0
        ? 75
        : Math.round((skillMatches.length / jobSkills.length) * 100);

    const experience = this.experienceScore(job.experienceLevel, profile.experienceLevel);
    const education = this.educationScore(job.department, profile.filiere || profile.domaine);

    const overall = Math.round(skills * 0.5 + experience * 0.3 + education * 0.2);
    const label =
      overall >= 85 ? 'Excellent match' : overall >= 70 ? 'High match' : overall >= 50 ? 'Good match' : 'Fair match';

    return { overall, skills, experience, education, label };
  }

  private experienceScore(jobLevel?: string, profileLevel?: string): number {
    const levels = ['JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];
    const jobIdx = levels.indexOf(jobLevel || 'JUNIOR');
    const profileIdx = levels.indexOf(profileLevel || 'JUNIOR');
    const diff = Math.abs(jobIdx - profileIdx);
    return Math.max(40, 100 - diff * 25);
  }

  private educationScore(department?: string, field?: string): number {
    if (!department || !field) return 70;
    const d = department.toLowerCase();
    const f = field.toLowerCase();
    if (d.includes('engineer') && (f.includes('info') || f.includes('gl'))) return 92;
    if (d.includes(f) || f.includes(d)) return 88;
    return 72;
  }
}
