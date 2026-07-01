import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CaptchaService } from './captcha.service';
import {
  CaptchaChallenge,
  CaptchaType,
  CaptchaVerifiedState
} from './captcha.models';

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.css']
})
export class CaptchaComponent implements OnInit {
  @Output() verified = new EventEmitter<CaptchaVerifiedState>();
  @Output() verificationReset = new EventEmitter<void>();

  captchaInitiated = false;
  challenge: CaptchaChallenge | null = null;
  captchaType: CaptchaType | null = null;
  loading = false;
  verifying = false;
  errorMessage = '';
  isVerified = false;

  /** IMAGE / LOGO : sélection multiple ou unique */
  selectedImageIds = new Set<string>();

  /** QUESTION : choix unique */
  selectedOptionId: string | null = null;

  /** PUZZLE : position glissée */
  puzzleX = 0;
  puzzleY = 120;
  slotX = 0;
  slotY = 0;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private isDragging = false;

  verifiedState: CaptchaVerifiedState | null = null;

  constructor(private captchaService: CaptchaService) {}

  ngOnInit(): void {
    // Don't load captcha immediately; wait for checkbox
  }

  onCaptchaCheckboxChange(): void {
    this.captchaInitiated = true;
    this.loadCaptcha();
  }

  loadCaptcha(): void {
    this.loading = true;
    this.errorMessage = '';
    this.resetSelections();
    this.isVerified = false;
    this.verifiedState = null;
    this.verificationReset.emit();

    this.captchaService.generate().subscribe({
      next: (challenge) => {
        this.challenge = challenge;
        this.captchaType = challenge.captchaType;
        this.initPuzzleDefaults();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Unable to load CAPTCHA.';
      }
    });
  }

  toggleImageSelection(id: string): void {
    if (this.isVerified || this.captchaType === 'LOGO') {
      this.selectedImageIds.clear();
      this.selectedImageIds.add(id);
    } else {
      if (this.selectedImageIds.has(id)) {
        this.selectedImageIds.delete(id);
      } else {
        this.selectedImageIds.add(id);
      }
    }
  }

  isImageSelected(id: string): boolean {
    return this.selectedImageIds.has(id);
  }

  selectOption(id: string): void {
    this.selectedOptionId = id;
  }

  onPuzzlePointerDown(event: PointerEvent): void {
    if (!this.challenge?.puzzleData || this.isVerified) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.isDragging = true;
    const rect = target.parentElement?.getBoundingClientRect();
    if (!rect) return;
    this.dragOffsetX = event.clientX - rect.left - this.puzzleX;
    this.dragOffsetY = event.clientY - rect.top - this.puzzleY;
  }

  onPuzzlePointerMove(event: PointerEvent): void {
    if (!this.isDragging || !this.challenge?.puzzleData) return;
    const container = (event.currentTarget as HTMLElement).parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pd = this.challenge.puzzleData;
    let x = event.clientX - rect.left - this.dragOffsetX;
    let y = event.clientY - rect.top - this.dragOffsetY;
    x = Math.max(0, Math.min(x, pd.canvasWidth - pd.pieceWidth));
    y = Math.max(0, Math.min(y, pd.canvasHeight - pd.pieceHeight));
    this.puzzleX = x;
    this.puzzleY = y;
  }

  onPuzzlePointerUp(event: PointerEvent): void {
    this.isDragging = false;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch { /* ignore */ }

    if (!this.challenge?.puzzleData) {
      return;
    }

    const snapTolerance = 90;
    if (
      Math.abs(this.puzzleX - this.slotX) <= snapTolerance &&
      Math.abs(this.puzzleY - this.slotY) <= snapTolerance
    ) {
      this.puzzleX = this.slotX;
      this.puzzleY = this.slotY;
    }
  }

  verifyCaptcha(): void {
    if (!this.challenge || this.isVerified) return;

    const answers = this.buildAnswers();
    if (answers.length === 0) {
      this.errorMessage = 'Please complete the CAPTCHA challenge.';
      return;
    }

    this.verifying = true;
    this.errorMessage = '';

    this.captchaService.verify({
      captchaId: this.challenge.captchaId,
      answers
    }).subscribe({
      next: (res) => {
        this.verifying = false;
        if (res.success && res.captchaId && res.captchaToken) {
          this.isVerified = true;
          this.verifiedState = {
            captchaId: res.captchaId,
            captchaToken: res.captchaToken
          };
          this.verified.emit(this.verifiedState);
        } else {
          this.errorMessage = res.message || 'Validation failed.';
        }
      },
      error: (err) => {
        this.verifying = false;
        this.errorMessage = err.error?.error || 'Incorrect answer.';
        if (err.error?.code === 'CAPTCHA_MAX_ATTEMPTS' || err.error?.code === 'CAPTCHA_EXPIRED') {
          this.loadCaptcha();
        }
      }
    });
  }

  private buildAnswers(): string[] {
    switch (this.captchaType) {
      case 'IMAGE':
        return Array.from(this.selectedImageIds).sort();
      case 'LOGO':
        return this.selectedImageIds.size ? [Array.from(this.selectedImageIds)[0]] : [];
      case 'QUESTION':
        return this.selectedOptionId ? [this.selectedOptionId] : [];
      case 'PUZZLE':
        return [String(this.puzzleX), String(this.puzzleY)];
      default:
        return [];
    }
  }

  private resetSelections(): void {
    this.selectedImageIds.clear();
    this.selectedOptionId = null;
    this.initPuzzleDefaults();
  }

  private initPuzzleDefaults(): void {
    const pd = this.challenge?.puzzleData;
    if (pd) {
      this.slotX = pd.slotX;
      this.slotY = pd.slotY;
      this.puzzleX = pd.pieceStartX;
      this.puzzleY = pd.pieceStartY;
    } else {
      this.slotX = 0;
      this.slotY = 0;
      this.puzzleX = 0;
      this.puzzleY = 120;
    }
  }
}
