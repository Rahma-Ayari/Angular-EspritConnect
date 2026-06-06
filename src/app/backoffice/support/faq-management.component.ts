import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { TicketCategory } from '../../models/support.model';
import { FAQ } from '../../models/faq.model';

@Component({
  selector: 'app-faq-management',
  templateUrl: './faq-management.component.html',
  styleUrl: './faq-management.component.css'
})
export class FaqManagementComponent implements OnInit {
  faqs: FAQ[] = [];
  categories: TicketCategory[] = [];
  faqForm: FormGroup;
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  loading = true;

  constructor(
    private supportService: SupportService,
    private fb: FormBuilder
  ) {
    this.faqForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(5)]],
      answer: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.supportService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.supportService.getAllFAQs().subscribe(faqs => {
        this.faqs = faqs;
        this.loading = false;
      });
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.faqForm.reset();
    this.showModal = true;
  }

  openEditModal(faq: FAQ) {
    this.isEditing = true;
    this.editingId = faq.id;
    this.faqForm.patchValue({
      question: faq.question,
      answer: faq.answer,
      categoryId: faq.categoryId || faq.category?.id || null
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.faqForm.reset();
  }

  onSubmit() {
    if (this.faqForm.invalid) return;

    const faqData = this.faqForm.value;

    if (this.isEditing && this.editingId) {
      this.supportService.updateFAQ(this.editingId, faqData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    } else {
      this.supportService.createFAQ(faqData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    }
  }

  deleteFaq(id: number) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      this.supportService.deleteFAQ(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  getCategoryName(id: number | undefined): string {
    if (!id) return 'General';
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }
}
