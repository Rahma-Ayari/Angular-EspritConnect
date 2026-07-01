import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../services/activity.service';
import { ActivityLog, ActivityLogPage } from '../../models/activity-log.model';
import { AIAnalysisResponse } from '../../models/ai-analysis-response.model';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatCardModule, 
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.css']
})
export class ActivityHistoryComponent implements OnInit {
  activities: ActivityLog[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  displayedColumns: string[] = ['username', 'action', 'entity', 'ipAddress', 'createdAt'];
  
  statistics: any;
  aiAnalysis: AIAnalysisResponse | null = null;
  loading = true;
  analyzing = false;

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
    this.loadStatistics();
  }

  loadActivities(): void {
    this.loading = true;
    this.activityService.getAllActivities(this.pageIndex, this.pageSize).subscribe({
      next: (data: ActivityLogPage) => {
        this.activities = data.content;
        this.totalElements = data.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching activities', err);
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    this.activityService.getStatistics().subscribe({
      next: (data) => this.statistics = data,
      error: (err) => console.error('Error fetching statistics', err)
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadActivities();
  }

  runAIAnalysis(): void {
    this.analyzing = true;
    this.activityService.analyzeActivities().subscribe({
      next: (data) => {
        this.aiAnalysis = data;
        this.analyzing = false;
      },
      error: (err) => {
        console.error('Error analyzing activities', err);
        this.analyzing = false;
      }
    });
  }
}
