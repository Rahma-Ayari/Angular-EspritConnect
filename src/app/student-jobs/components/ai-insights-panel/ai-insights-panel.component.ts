import { Component, Input } from '@angular/core';
import { CareerRecommendationResult, CvReviewResult } from '../../models/student-job.model';

@Component({
  selector: 'app-ai-insights-panel',
  templateUrl: './ai-insights-panel.component.html',
  styleUrls: ['./ai-insights-panel.component.css']
})
export class AiInsightsPanelComponent {
  @Input() cvReview?: CvReviewResult;
  @Input() career?: CareerRecommendationResult;
}
