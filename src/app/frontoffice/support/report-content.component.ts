import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModerationService } from '../../services/moderation.service';
import { ModerationContentType } from '../../models/moderation.model';

@Component({
  selector: 'app-report-content',
  templateUrl: './report-content.component.html',
  styleUrls: ['./report-content.component.css']
})
export class ReportContentComponent {
  form: FormGroup;
  contentTypes: { value: ModerationContentType; label: string }[] = [
    { value: 'FORUM_POST', label: 'Forum post' },
    { value: 'MESSAGE', label: 'Message' },
    { value: 'USER_PROFILE', label: 'User profile' },
    { value: 'JOB_OFFER', label: 'Job offer' },
    { value: 'OTHER', label: 'Other' }
  ];
  submitted = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private moderationService: ModerationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      contentType: ['FORUM_POST', Validators.required],
      contentRefId: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.error = '';
    this.moderationService.submitReport(this.form.value).subscribe({
      next: () => {
        this.submitted = true;
      },
      error: () => {
        this.error = 'Could not submit report. Make sure you are logged in (JWT).';
      }
    });
  }

  back(): void {
    this.router.navigate(['/support']);
  }

  typeIcon(value: string): string {
    const icons: Record<string, string> = {
      FORUM_POST:   'fa-comments',
      MESSAGE:      'fa-envelope',
      USER_PROFILE: 'fa-user',
      JOB_OFFER:    'fa-briefcase',
      OTHER:        'fa-ellipsis',
    };
    return icons[value] ?? 'fa-flag';
  }

  appendReason(text: string): void {
    const current = this.form.get('reason')?.value || '';
    const updated = current ? current + ' ' + text : text;
    this.form.get('reason')?.setValue(updated);
  }
}
