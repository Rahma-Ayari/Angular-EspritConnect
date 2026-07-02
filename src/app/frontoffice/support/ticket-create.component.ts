import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService } from '../../services/support.service';
import { TicketCategory, TicketPriority } from '../../models/support.model';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.css']
})
export class TicketCreateComponent implements OnInit {
  ticketForm: FormGroup;
  categories: TicketCategory[] = [];
  priorities = Object.values(TicketPriority);
  isSubmitting = false;
  
  // File Upload State
  selectedFile: File | null = null;
  isUploading = false;
  attachmentUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      categoryId: [''],
      priority: [TicketPriority.MEDIUM, Validators.required],
      tagsString: ['']
    });
  }

  ngOnInit(): void {
    this.supportService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => console.warn('Failed to load categories:', err)
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.isUploading = true;
      this.supportService.uploadFile(file).subscribe({
        next: (res) => {
          this.attachmentUrl = res.url;
          this.isUploading = false;
        },
        error: (err) => {
          console.error('File upload failed:', err);
          alert('Failed to upload file');
          this.isUploading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.isSubmitting = true;
      
      const tags = this.ticketForm.value.tagsString
        ? this.ticketForm.value.tagsString.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
        : [];

      const ticketData = {
        title: this.ticketForm.value.title,
        description: this.ticketForm.value.description,
        categoryId: this.ticketForm.value.categoryId ? Number(this.ticketForm.value.categoryId) : null,
        priority: this.ticketForm.value.priority,
        attachmentUrl: this.attachmentUrl || null,
        tags: tags
      };

      this.supportService.createTicket(ticketData as any).subscribe({
        next: (ticket) => {
          this.router.navigate(['/support/ticket', ticket.id]);
        },
        error: (err) => {
          console.error('Ticket submission failed:', err);
          const status = err.status || 'Unknown';
          const backendMsg = err.error?.message || err.message;
          const msg = backendMsg || 'An unexpected error occurred. Please try again.';
          alert(`Error ${status}: ${msg}`);
          this.isSubmitting = false;
        }
      });
    }
  }
}
