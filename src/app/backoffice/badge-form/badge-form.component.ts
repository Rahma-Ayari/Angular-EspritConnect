import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeService } from '../../services/badge.service';
import { BadgeType } from '../../models/badge.model';

@Component({
  selector: 'app-badge-form',
  templateUrl: './badge-form.component.html',
  styleUrls: ['./badge-form.component.css']
})
export class BadgeFormComponent implements OnInit {

  badgeForm!: FormGroup;
  isEditMode = false;
  badgeId: number | null = null;
  loading = false;
  submitting = false;

  presetIcons = ['shield-blue', 'shield-purple', 'shield-green', 'shield-yellow'];
  selectedIcon = '';
  useCustomIcon = false;

  readonly BadgeType = BadgeType;

  badgeTypes = [
    { value: BadgeType.MANUALLY_ASSIGNED, label: 'Manually Assigned', desc: 'Admin manually grants this badge to users.' },
    { value: BadgeType.AUTOMATICALLY_EARNED, label: 'Automatically Earned', desc: 'Awarded when a user meets activity thresholds.' }
  ];

  constructor(
    private fb: FormBuilder,
    private badgeService: BadgeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get isAuto(): boolean {
    return this.badgeForm?.get('badgeType')?.value === BadgeType.AUTOMATICALLY_EARNED;
  }

  ngOnInit(): void {
    this.badgeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      criteria: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      badgeType: [BadgeType.MANUALLY_ASSIGNED, [Validators.required]],
      enabled: [true],
      postThreshold: [null],
      resolvedTicketsThreshold: [null]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.badgeId = +idParam;
      this.loadBadge(this.badgeId);
    }
  }

  loadBadge(id: number): void {
    this.loading = true;
    this.badgeService.getBadgeById(id).subscribe({
      next: (badge) => {
        this.badgeForm.patchValue({
          name: badge.name,
          criteria: badge.criteria,
          icon: badge.icon,
          badgeType: badge.badgeType,
          enabled: badge.enabled,
          postThreshold: badge.postThreshold ?? null,
          resolvedTicketsThreshold: badge.resolvedTicketsThreshold ?? null
        });
        this.selectedIcon = badge.icon;
        this.useCustomIcon = !this.presetIcons.includes(badge.icon);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load badge:', err);
        this.loading = false;
      }
    });
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.useCustomIcon = false;
    this.badgeForm.patchValue({ icon });
  }

  toggleCustomIcon(): void {
    this.useCustomIcon = !this.useCustomIcon;
    if (this.useCustomIcon) {
      this.selectedIcon = '';
      this.badgeForm.patchValue({ icon: '' });
    }
  }

  onSubmit(): void {
    if (this.badgeForm.invalid) {
      this.badgeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = {
      ...this.badgeForm.value,
      postThreshold: this.isAuto ? (this.badgeForm.value.postThreshold || null) : null,
      resolvedTicketsThreshold: this.isAuto ? (this.badgeForm.value.resolvedTicketsThreshold || null) : null
    };

    const request$ = this.isEditMode && this.badgeId
      ? this.badgeService.updateBadge(this.badgeId, formData)
      : this.badgeService.createBadge(formData);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/badges']);
      },
      error: (err) => {
        console.error('Failed to save badge:', err);
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/badges']);
  }

  getIconColor(icon: string): string {
    if (icon.includes('blue')) return '#3498db';
    if (icon.includes('purple')) return '#9b59b6';
    if (icon.includes('green')) return '#2ecc71';
    if (icon.includes('yellow')) return '#f1c40f';
    return 'var(--primary)';
  }
}
