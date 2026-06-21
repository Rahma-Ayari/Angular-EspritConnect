import { Component, EventEmitter, Input, Output } from '@angular/core';
import { poweredByText } from '../../../ai/providers/gemini.provider';

@Component({
  selector: 'app-ai-output-panel',
  templateUrl: './ai-output-panel.component.html',
  styleUrls: ['./ai-output-panel.component.css']
})
export class AiOutputPanelComponent {
  @Input() loading = false;
  @Input() provider?: string;
  @Input() cached = false;
  @Input() disclaimer?: string;
  @Input() emptyMessage = 'Generate content to see AI results here.';
  @Input() showActions = true;
  @Input() acceptLabel = 'Accept';
  @Input() hasContent = false;

  @Output() regenerate = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();

  get poweredBy(): string {
    return poweredByText(this.provider);
  }
}
