import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { JobOffer } from '../../jobs/models/job.model';
import {
  CareerRecommendationResult,
  CoverLetterResult,
  CvReviewResult,
  InterviewPrepResult,
  StudentProfile
} from '../models/student-job.model';

@Injectable({ providedIn: 'root' })
export class AiCareerService {
  reviewCV(fileName: string, textHint?: string): Observable<CvReviewResult> {
    const base = (textHint || fileName || '').toLowerCase();
    const skills = this.extractTokens(base, [
      'react', 'angular', 'java', 'spring', 'python', 'sql', 'docker', 'typescript', 'node'
    ]);
    return of({
      skills: skills.length ? skills : ['JavaScript', 'Angular', 'Git'],
      experience: ['Academic projects', 'Internship experience'],
      projects: ['Web application', 'REST API project'],
      strengths: [
        'Clear technical stack alignment',
        'Structured project descriptions',
        'Good use of action verbs'
      ],
      weaknesses: [
        'Quantify impact with metrics where possible',
        'Add more role-specific keywords from target jobs'
      ],
      recommendations: [
        'Tailor skills section to each job posting',
        'Add a short professional summary at the top',
        'Highlight teamwork and problem-solving outcomes'
      ]
    }).pipe(delay(1200));
  }

  generateCoverLetter(job: JobOffer, profile: StudentProfile): Observable<CoverLetterResult> {
    const letter = `Dear Hiring Manager,

I am writing to apply for the ${job.title} position at ${job.companyName || 'your company'}. As a motivated ${profile.role === 'ALUMNI' ? 'alumni' : 'student'} with strengths in ${profile.skills.slice(0, 3).join(', ')}, I am excited to contribute to your team.

My background in ${profile.filiere || profile.domaine || 'technology'} has prepared me to deliver quality work in ${job.department || 'your department'}. I am particularly drawn to this role because of its focus on ${(job.technologies || job.requiredSkills || []).slice(0, 2).join(' and ') || 'innovation'}.

I would welcome the opportunity to discuss how my profile aligns with your needs.

Sincerely,
${profile.nom}`;
    return of({ letter }).pipe(delay(1500));
  }

  generateInterviewQuestions(job: JobOffer): Observable<InterviewPrepResult> {
    const title = job.title || 'this role';
    return of({
      hrQuestions: [
        'Tell me about yourself and why you applied for this role.',
        'What do you know about our company?',
        'Describe a challenge you faced in a team project.'
      ],
      technicalQuestions: [
        `Explain a recent project relevant to ${title}.`,
        `How would you approach debugging a production issue in ${(job.technologies || ['your stack'])[0]}?`,
        'What is the difference between REST and GraphQL?'
      ],
      roleQuestions: [
        `Why does ${title} interest you at this stage of your career?`,
        'Which requirement in the job description matches your strongest skill?',
        'How do you stay updated with industry trends?'
      ]
    }).pipe(delay(1000));
  }

  recommendCareerPath(profile: StudentProfile): Observable<CareerRecommendationResult> {
    const field = profile.filiere || profile.domaine || 'Technology';
    return of({
      skills: [...profile.skills, 'CI/CD', 'System Design'],
      certifications: ['AWS Cloud Practitioner', 'Scrum Foundation'],
      projects: ['Portfolio website', 'Open-source contribution', 'Capstone MVP'],
      learningPaths: [
        `${field} advanced coursework`,
        'Interview preparation track',
        'Cloud deployment hands-on labs'
      ]
    }).pipe(delay(900));
  }

  suggestSkills(profile: StudentProfile, targetRole?: string): Observable<string[]> {
    const role = (targetRole || 'full-stack developer').toLowerCase();
    const extra = role.includes('front')
      ? ['React', 'CSS', 'Accessibility']
      : role.includes('back')
        ? ['Spring Boot', 'PostgreSQL', 'API Security']
        : ['TypeScript', 'Docker', 'Agile'];
    return of([...new Set([...profile.skills, ...extra])]).pipe(delay(500));
  }

  private extractTokens(text: string, catalog: string[]): string[] {
    return catalog.filter((t) => text.includes(t)).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }
}
