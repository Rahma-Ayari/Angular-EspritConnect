import { Component, OnInit } from '@angular/core';
import { JobOffer } from '../../../jobs/models/job.model';
import { AiCareerService } from '../../services/ai-career.service';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import { StudentContextService } from '../../services/student-context.service';
import {
  CareerRecommendationResult,
  CoverLetterResult,
  CvReviewResult,
  InterviewPrepResult,
  StudentProfile
} from '../../models/student-job.model';

@Component({
  selector: 'app-career-assistant',
  templateUrl: './career-assistant.component.html',
  styleUrls: ['./career-assistant.component.css']
})
export class CareerAssistantComponent implements OnInit {
  activeTab: 'cv' | 'cover' | 'interview' | 'career' = 'cv';
  profile?: StudentProfile;
  jobs: JobOffer[] = [];
  selectedJobId?: number;

  cvLoading = false;
  cvResult?: CvReviewResult;
  cvFileName = '';

  coverLoading = false;
  coverResult?: CoverLetterResult;
  typingCover = '';

  interviewLoading = false;
  interviewResult?: InterviewPrepResult;

  careerLoading = false;
  careerResult?: CareerRecommendationResult;

  constructor(
    private ai: AiCareerService,
    private studentContext: StudentContextService,
    private browse: StudentJobsBrowseService
  ) {}

  ngOnInit(): void {
    this.studentContext.getProfile().subscribe((p) => (this.profile = p));
    this.browse.search({ limit: 20, page: 1 }).subscribe((res) => (this.jobs = res.data));
  }

  onCvSelected(file: File): void {
    this.cvFileName = file.name;
    this.cvLoading = true;
    this.ai.reviewCV(file.name).subscribe({
      next: (r) => {
        this.cvResult = r;
        this.cvLoading = false;
      },
      error: () => (this.cvLoading = false)
    });
  }

  generateCover(): void {
    if (!this.profile || !this.selectedJobId) return;
    const job = this.jobs.find((j) => j.id === this.selectedJobId);
    if (!job) return;
    this.coverLoading = true;
    this.typingCover = '';
    this.ai.generateCoverLetter(job, this.profile).subscribe({
      next: (r) => {
        this.coverResult = r;
        this.typewriter(r.letter);
        this.coverLoading = false;
      },
      error: () => (this.coverLoading = false)
    });
  }

  generateInterview(): void {
    const job = this.jobs.find((j) => j.id === this.selectedJobId) || this.jobs[0];
    if (!job) return;
    this.interviewLoading = true;
    this.ai.generateInterviewQuestions(job).subscribe({
      next: (r) => {
        this.interviewResult = r;
        this.interviewLoading = false;
      },
      error: () => (this.interviewLoading = false)
    });
  }

  loadCareer(): void {
    if (!this.profile) return;
    this.careerLoading = true;
    this.ai.recommendCareerPath(this.profile).subscribe({
      next: (r) => {
        this.careerResult = r;
        this.careerLoading = false;
      },
      error: () => (this.careerLoading = false)
    });
  }

  private typewriter(text: string): void {
    let i = 0;
    const step = () => {
      if (i <= text.length) {
        this.typingCover = text.slice(0, i);
        i += 3;
        setTimeout(step, 12);
      }
    };
    step();
  }
}
