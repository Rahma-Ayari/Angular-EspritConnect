import { Component, EventEmitter, Input, Output } from '@angular/core';
import { providerBadge } from '../../models/student-ai.model';

@Component({
  selector: 'app-ai-result-panel',
  templateUrl: './ai-result-panel.component.html',
  styleUrls: ['./ai-result-panel.component.css']
})
export class AiResultPanelComponent {
  @Input() loading = false;
  @Input() error = '';
  @Input() provider = '';
  @Input() showActions = true;
  @Input() acceptLabel = 'Accept Suggestions';
  @Input() copyText = '';
  @Output() regenerate = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();

  copied = false;

  get badge(): string {
    return providerBadge(this.provider);
  }

  onCopy(): void {
    if (this.copyText) {
      navigator.clipboard?.writeText(this.copyText);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    }
    this.copy.emit();
  }
}
