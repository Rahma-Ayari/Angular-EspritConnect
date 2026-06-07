import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';

interface MailingList {
  id: number;
  name: string;
  description?: string;
  membersCount?: number;
}

interface MailingListMember {
  id: number;
  email: string;
  nom?: string;
}

@Component({
  selector: 'app-message-users',
  templateUrl: './message-users.component.html',
  styleUrls: ['./message-users.component.css']
})
export class MessageUsersComponent implements OnInit {
  private base = environment.backendBaseUrl;

  loadingLists = false;
  loadingMembers = false;
  sending = false;
  loadingPreview = false;
  successMsg = '';
  errorMsg = '';
  memberQuery = '';

  mailingLists: MailingList[] = [];
  members: MailingListMember[] = [];
  selectedMailingListId: number | null = null;
  selectedMemberEmails: string[] = [];

  previewHtml = '';

  messageForm = {
    subject: '',
    htmlBody: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMailingLists();
  }

  get selectedMailingList(): MailingList | undefined {
    return this.mailingLists.find(list => list.id === this.selectedMailingListId);
  }

  get filteredMembers(): MailingListMember[] {
    const q = this.memberQuery.trim().toLowerCase();
    if (!q) return this.members;
    return this.members.filter(m =>
      (m.nom || '').toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }

  get selectedMembersCount(): number {
    return this.selectedMemberEmails.length;
  }

  get recipientsSummary(): string {
    if (!this.selectedMailingList) return 'Aucun destinataire sélectionné';
    if (!this.selectedMembersCount) {
      return `Toute la liste "${this.selectedMailingList.name}"`;
    }
    return `${this.selectedMembersCount} destinataire(s) sélectionné(s) dans "${this.selectedMailingList.name}"`;
  }

  get canSend(): boolean {
    return !!this.selectedMailingListId && !!this.messageForm.subject.trim() && !!this.messageForm.htmlBody.trim();
  }

  loadMailingLists(): void {
    this.loadingLists = true;
    this.http.get<MailingList[]>(`${this.base}/api/email-communications/mailing-lists`)
      .pipe(finalize(() => this.loadingLists = false))
      .subscribe({
        next: (lists) => this.mailingLists = lists || [],
        error: () => this.showError("Impossible de charger les mailing lists.")
      });
  }

  onMailingListChange(): void {
    this.selectedMemberEmails = [];
    this.memberQuery = '';
    this.members = [];

    if (!this.selectedMailingListId) return;

    this.loadingMembers = true;
    this.http.get<MailingListMember[]>(
      `${this.base}/api/email-communications/mailing-lists/${this.selectedMailingListId}/members`
    ).pipe(finalize(() => this.loadingMembers = false))
      .subscribe({
        next: (members) => this.members = members || [],
        error: () => this.showError("Impossible de charger les membres de cette liste.")
      });
  }

  isMemberSelected(email: string): boolean {
    return this.selectedMemberEmails.includes(email);
  }

  toggleMember(email: string): void {
    if (this.isMemberSelected(email)) {
      this.selectedMemberEmails = this.selectedMemberEmails.filter(e => e !== email);
      return;
    }
    this.selectedMemberEmails = [...this.selectedMemberEmails, email];
  }

  toggleAllFilteredMembers(selectAll: boolean): void {
    const visibleEmails = this.filteredMembers.map(m => m.email);
    if (selectAll) {
      this.selectedMemberEmails = Array.from(new Set([...this.selectedMemberEmails, ...visibleEmails]));
      return;
    }
    this.selectedMemberEmails = this.selectedMemberEmails.filter(e => !visibleEmails.includes(e));
  }

  sendMessage(): void {
    if (!this.canSend || !this.selectedMailingListId) return;
    if (!confirm(`Confirmer l'envoi à: ${this.recipientsSummary} ?`)) return;

    this.sending = true;
    this.clearMessages();

    const payload = {
      subject: this.messageForm.subject.trim(),
      htmlBody: this.messageForm.htmlBody.trim(),
      fromEmail: 'noreply@esprit.tn',
      recipientScope: 'MAILING_LIST',
      mailingListId: this.selectedMailingListId,
      recipientEmails: this.selectedMemberEmails.length ? this.selectedMemberEmails : undefined
    };

    this.http.post<void>(`${this.base}/api/email-communications/message-users/send-now`, payload)
      .pipe(finalize(() => this.sending = false))
      .subscribe({
        next: () => this.showSuccess('Campagne envoyée avec succès.'),
        error: (err) => {
          const backendMessage = err?.error?.message || err?.error || '';
          this.showError(backendMessage ? `Échec d'envoi : ${backendMessage}` : "Erreur lors de l'envoi de la campagne.");
        }
      });
  }

  loadPreview(): void {
    this.loadingPreview = true;
    this.previewHtml = '';
    this.clearMessages();

    // Preview is client-side (same content that will be sent).
    // Use a short delay to show a smooth loading state.
    setTimeout(() => {
      this.previewHtml = this.buildPreviewHtml();
      this.loadingPreview = false;
    }, 250);
  }

  resetForm(): void {
    if (!confirm('Réinitialiser la campagne (destinataires + contenu) ?')) return;
    this.clearMessages();
    this.selectedMailingListId = null;
    this.selectedMemberEmails = [];
    this.members = [];
    this.memberQuery = '';
    this.messageForm.subject = '';
    this.messageForm.htmlBody = '';
    this.previewHtml = '';
  }

  clearContent(): void {
    if (!confirm('Vider le sujet et le contenu ?')) return;
    this.clearMessages();
    this.messageForm.subject = '';
    this.messageForm.htmlBody = '';
    this.previewHtml = '';
  }

  buildPreviewHtml(): string {
    const subject = this.escapeHtml(this.messageForm.subject || 'Message Esprit Connect');
    const body = this.messageForm.htmlBody || '<em>Aucun contenu</em>';

    // Branded wrapper aligned with Activity Digest email design.
    return `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Esprit Connect - Message</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f3f4f6; -webkit-font-smoothing:antialiased;">
        <div style="width:100%; max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05); border:1px solid #e5e7eb; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

          <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding:40px 24px; text-align:center; color:#ffffff;">
            <div style="font-size:32px; font-weight:800; letter-spacing:1px; margin:0; font-family:Arial, sans-serif;">
              ESPRIT<span style="color:#ffd2d2;">Connect</span>
            </div>
            <div style="font-size:14px; opacity:0.85; margin-top:6px; font-family:Arial, sans-serif;">Se former autrement</div>
          </div>

          <div style="padding:32px 32px 10px;">
            <h2 style="margin:0; color:#111827; font-size:20px; font-weight:700;">${subject}</h2>
          </div>

          <div style="padding:0 32px 32px; color:#374151; font-size:14px; line-height:1.6;">
            ${body}
          </div>

          <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color:#ffe4e6; padding:24px 24px; font-size:12px; text-align:center; font-family:Arial, sans-serif; border-top:1px solid #fecaca;">
            <div style="font-weight:600; color:#ffffff; margin-bottom:6px;">ESPRIT Connect</div>
            <div style="margin-bottom:12px; opacity:0.8;">Vous recevez cet email car vous êtes inscrit sur la plateforme ESPRIT Connect.</div>
            <div style="border-top:1px solid rgba(255,255,255,0.25); padding-top:12px; opacity:0.9;">
              © 2026 ESPRIT — Honoris United Universities. Tous droits réservés.
            </div>
          </div>

        </div>
      </body>
      </html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 5000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    this.successMsg = '';
    setTimeout(() => this.errorMsg = '', 7000);
  }

  private clearMessages(): void {
    this.successMsg = '';
    this.errorMsg = '';
  }
}