import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupportService } from '../../services/support.service';
import { SupportTicket, TicketMessage, TicketStatus } from '../../models/support.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-ticket-detail',
  templateUrl: './admin-ticket-detail.component.html',
  styleUrls: ['./admin-ticket-detail.component.css']
})
export class AdminTicketDetailComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  ticketId!: number;
  ticket?: SupportTicket;
  messages: TicketMessage[] = [];
  newMessage: string = '';
  isInternal: boolean = false;
  
  statuses = Object.values(TicketStatus);

  // File attachment state
  selectedFile: File | null = null;
  attachmentPreviewUrl: string | null = null;
  uploadedAttachmentUrl: string | null = null;
  isUploading: boolean = false;
  uploadError: string | null = null;
  readonly BASE_URL = environment.backendBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket();
    this.loadMessages();
  }

  loadTicket(): void {
    this.supportService.getTicketById(this.ticketId).subscribe(data => this.ticket = data);
  }

  loadMessages(): void {
    this.supportService.getMessages(this.ticketId).subscribe(data => {
      this.messages = data;
    });
  }

  onStatusChange(status: any): void {
    this.supportService.updateTicketStatus(this.ticketId, status).subscribe(data => {
      this.ticket = data;
    });
  }

  // ---- File attachment handling ----

  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'File too large (max 10 MB).';
      return;
    }

    this.selectedFile = file;
    this.uploadError = null;
    this.uploadedAttachmentUrl = null;

    if (file.type.startsWith('image/')) {
      if (this.attachmentPreviewUrl) URL.revokeObjectURL(this.attachmentPreviewUrl);
      this.attachmentPreviewUrl = URL.createObjectURL(file);
    } else {
      this.attachmentPreviewUrl = null;
    }

    this.isUploading = true;
    this.supportService.uploadFile(file).subscribe({
      next: (res) => {
        this.uploadedAttachmentUrl = res.url;
        this.isUploading = false;
      },
      error: () => {
        this.uploadError = 'Upload failed. Try again.';
        this.isUploading = false;
        this.clearAttachment();
      }
    });
  }

  clearAttachment(): void {
    this.selectedFile = null;
    if (this.attachmentPreviewUrl) {
      URL.revokeObjectURL(this.attachmentPreviewUrl);
      this.attachmentPreviewUrl = null;
    }
    this.uploadedAttachmentUrl = null;
    this.uploadError = null;
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }

  // ---- Sending ----

  canSend(): boolean {
    return (this.newMessage.trim().length > 0 || !!this.uploadedAttachmentUrl) && !this.isUploading;
  }

  sendMessage(): void {
    if (!this.canSend()) return;
    this.supportService.addMessage(this.ticketId, {
      content: this.newMessage.trim(),
      isInternal: this.isInternal,
      attachmentUrl: this.uploadedAttachmentUrl ?? undefined
    }).subscribe(() => {
      this.newMessage = '';
      this.isInternal = false;
      this.clearAttachment();
      this.loadMessages();
    });
  }

  assignTicket(): void {
    if (!this.ticket) return;
    const adminId = this.supportService.CURRENT_USER_ID;
    this.supportService.assignTicket(this.ticketId, adminId).subscribe(data => {
      this.ticket = data;
    });
  }

  downloadHistory(): void {
    if (!this.ticket) return;
    this.supportService.exportTicketHistory(this.ticket.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_history_${this.ticket?.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }
}
