import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-digest-preview',
  template: `
    <div class="dp-wrap">
      <iframe *ngIf="html" [srcdoc]="html" class="dp-frame" sandbox="allow-same-origin"></iframe>
      <div *ngIf="!html" class="dp-empty">No preview available</div>
    </div>
  `,
  styles: [`
    .dp-wrap { width:100%; }
    .dp-frame { width:100%; height:480px; border:none; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.1); }
    .dp-empty { text-align:center; padding:40px; color:#9ca3af; }
  `]
})
export class DigestPreviewComponent {
  @Input() html = '';
}