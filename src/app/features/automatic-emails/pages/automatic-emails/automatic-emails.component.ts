// ============================================================
// automatic-emails.component.ts
// Interface complète : Birthday Email avec config + test
// ============================================================
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface BirthdaySettings {
  id?: number;
  active: boolean;
  subject: string;
  templateHtml: string;
  sendHour: number;
  lastRunAt?: string;
}

@Component({
  selector: 'app-automatic-emails',
  templateUrl: './automatic-emails.component.html',
  styleUrls: ['./automatic-emails.component.css']
})
export class AutomaticEmailsComponent implements OnInit {

  private base = 'http://localhost:8088/espritconnect';

  // ── État principal ──
  settings: BirthdaySettings = {
    active: true,
    subject: 'Happy Birthday from EspritConnect! 🎂',
    templateHtml: `<div style="text-align:center;padding:32px 20px;">
  <h1 style="color:#d7282f;margin:0 0 12px;">Happy Birthday, {{nom}}! 🎂</h1>
  <p style="color:#6c757d;line-height:1.6;font-size:15px;">
    The whole EspritConnect team wishes you a wonderful day!<br/>
    Take a moment to celebrate your achievements.
  </p>
  <a href="http://localhost:4200" style="display:inline-block;margin-top:20px;
     background:#d7282f;color:#fff;padding:14px 32px;border-radius:8px;
     text-decoration:none;font-weight:700;font-size:14px;">
    Visit EspritConnect
  </a>
</div>`,
    sendHour: 8
  };

  // ── États UI ──
  saving        = false;
  testEmail     = '';
  testName      = 'John';
  sendingTest   = false;
  showPreview   = false;
  showTestForm  = false;
  successMsg    = '';
  errorMsg      = '';
  loading       = true;

  // Getter pour la propriété 'nom' utilisée dans le template
  get nom(): string {
    return this.testName;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Charge les settings depuis l'API
    this.http.get<BirthdaySettings>(`${this.base}/api/email-communications/automatic-emails/birthday`)
      .subscribe({
        next: (data) => { this.settings = data; this.loading = false; },
        error: ()    => { this.loading = false; /* garde les valeurs par défaut */ }
      });
  }

  /** Sauvegarde la configuration */
  save(): void {
    this.saving = true;
    this.clearMsgs();

    const dto = {
      active:      this.settings.active,
      subject:     this.settings.subject,
      templateHtml: this.settings.templateHtml,
      sendHour:    this.settings.sendHour
    };

    this.http.put<BirthdaySettings>(
      `${this.base}/api/email-communications/automatic-emails/birthday`, dto
    ).subscribe({
      next: (res) => {
        this.settings = res;
        this.saving   = false;
        this.success('Paramètres sauvegardés avec succès !');
      },
      error: () => {
        this.saving = false;
        this.error('Erreur lors de la sauvegarde. Vérifiez le backend.');
      }
    });
  }

  /** Envoie un email de test */
  sendTest(): void {
    if (!this.testEmail.trim()) { this.error('Email de test requis.'); return; }
    this.sendingTest = true;
    this.clearMsgs();

    this.http.post(`${this.base}/api/email-communications/automatic-emails/birthday/test-send`, {
      toEmail: this.testEmail,
      nomDemo: this.testName || 'John'
    }).subscribe({
      next: ()  => { this.sendingTest = false; this.success(`Email de test envoyé à ${this.testEmail} !`); this.showTestForm = false; },
      error: () => { this.sendingTest = false; this.error('Échec envoi test. Vérifiez la config SMTP.'); }
    });
  }

  /** Génère l'HTML de preview en remplaçant {{nom}} */
  get previewHtml(): string {
    const name = this.testName || 'John';
    const body = this.settings.templateHtml.replace(/\{\{nom\}\}/g, name);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>body{margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif;}</style>
    </head><body>
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#d7282f,#ff6b6b);padding:40px;text-align:center;">
          <div style="font-size:64px;">🎂</div>
          <h1 style="margin:10px 0;color:#fff;font-size:28px;">Happy Birthday!</h1>
        </div>
        <div style="padding:32px;">${body}</div>
        <div style="background:#111827;color:#9ca3af;padding:16px;text-align:center;font-size:12px;">
          © EspritConnect — Honoris United Universities
        </div>
      </div>
    </body></html>`;
  }

  /** Heures disponibles pour l'envoi */
  get hours(): number[] {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  formatHour(h: number): string {
    return `${h.toString().padStart(2,'0')}:00`;
  }

  private success(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 5000);
  }
  private error(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => this.errorMsg = '', 6000);
  }
  private clearMsgs(): void { this.successMsg = ''; this.errorMsg = ''; }
}