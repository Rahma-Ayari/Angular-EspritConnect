import { Component, OnInit } from '@angular/core';
import { SupportService } from '../../services/support.service';
import { TicketCategory } from '../../models/support.model';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: TicketCategory[] = [];
  editingId: number | null = null;
  
  newCategory: Partial<TicketCategory> = {
    name: '',
    description: '',
    slaHours: 48
  };

  constructor(private supportService: SupportService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.supportService.getCategories().subscribe(data => this.categories = data);
  }

  saveCategory(): void {
    if (!this.newCategory.name) return;

    if (this.editingId) {
      this.supportService.updateCategory(this.editingId, this.newCategory as TicketCategory).subscribe(() => {
        this.resetForm();
        this.loadCategories();
      });
    } else {
      this.supportService.createCategory(this.newCategory as TicketCategory).subscribe(() => {
        this.resetForm();
        this.loadCategories();
      });
    }
  }

  editCategory(cat: TicketCategory): void {
    this.editingId = cat.id;
    this.newCategory = { ...cat };
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category? All linked tickets and FAQs might be affected.')) {
      this.supportService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.newCategory = { name: '', description: '', slaHours: 48 };
  }

  onSeedData(): void {
    this.supportService.seedData().subscribe(() => {
      this.loadCategories();
    });
  }
}
