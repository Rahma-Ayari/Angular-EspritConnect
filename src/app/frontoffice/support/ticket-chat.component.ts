import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupportService } from '../../services/support.service';
import { SupportTicket, TicketMessage, TicketStatus } from '../../models/support.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-ticket-chat',
  templateUrl: './ticket-chat.component.html',
  styleUrls: ['./ticket-chat.component.css']
})
export class TicketChatComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  ticketId!: number;
  ticket?: SupportTicket;
  messages: TicketMessage[] = [];
  newMessage: string = '';
  pollingSubscription?: Subscription;

  // File attachment state
  selectedFile: File | null = null;
  attachmentPreviewUrl: string | null = null;
  uploadedAttachmentUrl: string | null = null;
  isUploading: boolean = false;
  uploadError: string | null = null;
  readonly BASE_URL = 'http://localhost:8088/espritconnect';

  constructor(
    private route: ActivatedRoute,
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket();
    this.loadMessages();
    // Simple polling for new messages every 10 seconds
    this.pollingSubscription = interval(10000).subscribe(() => this.loadMessages());
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.attachmentPreviewUrl) {
      URL.revokeObjectURL(this.attachmentPreviewUrl);
    }
  }

  loadTicket(): void {
    this.supportService.getTicketById(this.ticketId).subscribe({
      next: data => this.ticket = data,
      error: err => console.error('Failed to load ticket:', err)
    });
  }

  loadMessages(): void {
    this.supportService.getMessages(this.ticketId).subscribe({
      next: data => {
        if (data.length !== this.messages.length) {
          this.messages = data;
          this.scrollToBottom();
        }
      },
      error: err => console.warn('Failed to load messages:', err)
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
    // Guard: max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'File is too large (max 10 MB).';
      return;
    }

    this.selectedFile = file;
    this.uploadError = null;
    this.uploadedAttachmentUrl = null;

    // Generate a local preview for images
    if (file.type.startsWith('image/')) {
      if (this.attachmentPreviewUrl) URL.revokeObjectURL(this.attachmentPreviewUrl);
      this.attachmentPreviewUrl = URL.createObjectURL(file);
    } else {
      this.attachmentPreviewUrl = null;
    }

    // Upload immediately
    this.isUploading = true;
    this.supportService.uploadFile(file).subscribe({
      next: (res) => {
        this.uploadedAttachmentUrl = res.url;
        this.isUploading = false;
      },
      error: () => {
        this.uploadError = 'Upload failed. Please try again.';
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
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  // ---- Sending ----

  canSend(): boolean {
    const hasText = this.newMessage.trim().length > 0;
    const hasAttachment = !!this.uploadedAttachmentUrl;
    return (hasText || hasAttachment) && !this.isUploading && this.ticket?.status !== TicketStatus.CLOSED;
  }

  sendMessage(): void {
    if (!this.canSend()) return;

    this.supportService.addMessage(this.ticketId, {
      content: this.newMessage.trim(),
      isInternal: false,
      attachmentUrl: this.uploadedAttachmentUrl ?? undefined
    }).subscribe(() => {
      this.newMessage = '';
      this.clearAttachment();
      this.loadMessages();
    });
  }

  isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }

  reopenTicket(): void {
    if (!this.ticket) return;
    this.supportService.reopenTicket(this.ticket.id).subscribe(data => {
      this.ticket = data;
      this.loadMessages();
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

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.messages-simple');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
