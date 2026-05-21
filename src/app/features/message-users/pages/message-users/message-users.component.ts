import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-message-users',
  templateUrl: './message-users.component.html',
  styleUrls: ['./message-users.component.css']
})
export class MessageUsersComponent {
  private base = 'http://localhost:8088/espritconnect';

  openSection = 'recipients';
  sending = false;
  successMsg = '';
  errorMsg = '';
  showPreview = false;

  selectedRecipients = 'none';

  recipientOptions = [
    { value: 'all',      label: 'Tous les utilisateurs',  desc: 'Tous les utilisateurs inscrits et actifs' },
    { value: 'students', label: 'Étudiants',              desc: 'Tous les étudiants inscrits' },
    { value: 'alumni',   label: 'Alumni',                  desc: 'Tous les anciens étudiants' },
    { value: 'companies',label: 'Entreprises',             desc: 'Toutes les entreprises partenaires' }
  ];

  messageForm = {
    sujet: '',
    contenu: '',
    from: 'noreply@esprit.tn',
    testEmail: ''
  };

  constructor(private http: HttpClient) {}

  getRecipientsLabel(): string {
    return this.recipientOptions.find(r => r.value === this.selectedRecipients)?.label || '';
  }

  sendMessage(): void {
    if (!this.messageForm.sujet || !this.messageForm.contenu) return;
    if (!confirm(`Envoyer l'email à : ${this.getRecipientsLabel()} ?`)) return;
    this.sending = true;

    // Appel API Spring Boot
    this.http.post(`${this.base}/api/email/send-bulk`, {
      recipientGroup: this.selectedRecipients,
      sujet: this.messageForm.sujet,
      contenu: this.messageForm.contenu,
      from: this.messageForm.from
    }).subscribe({
      next: () => {
        this.sending = false;
        this.successMsg = 'Email envoyé avec succès !';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.sending = false;
        this.errorMsg = 'Erreur lors de l\'envoi. Vérifiez le backend.';
        setTimeout(() => this.errorMsg = '', 6000);
      }
    });
  }

  sendTest(): void {
    if (!this.messageForm.testEmail) return;
    this.sending = true;
    this.http.post(`${this.base}/api/email/send-test`, {
      to: this.messageForm.testEmail,
      sujet: this.messageForm.sujet || 'Test email',
      contenu: this.messageForm.contenu || 'Ceci est un test.'
    }).subscribe({
      next: () => {
        this.sending = false;
        this.successMsg = `Email de test envoyé à ${this.messageForm.testEmail}`;
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.sending = false;
        this.errorMsg = 'Erreur lors de l\'envoi du test.';
      }
    });
  }

  previewMessage(): void {
    this.showPreview = !this.showPreview;
  }

  buildPreviewHtml(): string {
    return `<div style="max-width:580px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">
      <h2 style="color:#1a1a2e;">${this.messageForm.sujet || '(Sans sujet)'}</h2>
      <div style="color:#374151;line-height:1.6;white-space:pre-wrap;">${this.messageForm.contenu || ''}</div>
      <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="color:#9ca3af;font-size:12px;">Envoyé depuis EspritConnect — noreply@esprit.tn</p>
    </div>`;
  }
}