import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { ForumCategory } from '../../models/forum.models';

@Component({
  selector: 'app-forum-categories',
  templateUrl: './forum-categories.component.html',
  styleUrls: ['./forum-categories.component.css']
})
export class ForumCategoriesComponent implements OnInit {

  categories: ForumCategory[] = [];
  postCounts: Record<number, number> = {};

  showModal = false;
  editingCategory: ForumCategory | null = null;

  // Form Fields
  name = '';
  description = '';
  icon = 'settings';
  color = 'blue';

  loading = true;
  successMsg = '';
  errorMsg = '';
  saving = false;

  // Premium predefined colors & icons
  availableColors = ['blue', 'purple', 'green', 'amber', 'red'];
  availableIcons = [
    { name: 'settings', label: 'Technologie' },
    { name: 'briefcase', label: 'Carrière / PFE' },
    { name: 'home', label: 'Vie estudiantine' },
    { name: 'hand', label: 'Orientation' },
    { name: 'users', label: 'Social' }
  ];

  constructor(private forumService: ForumService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      hand: 'M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.3 0-2.5-.6-3.3-1.6l-8-10c-.7-.9-.7-2.1 0-3 .7-.9 1.9-1.1 2.8-.4l4.8 3.6V4c0-1.1.9-2 2-2s2 .9 2 2v5.5c.5-.3 1-.5 1.5-.5h2c.8 0 1.5.3 2 .8.5-.5 1.2-.8 2-.8H21c1.1 0 2 .9 2 1.5z',
      users: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      briefcase: 'M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.51 15.49 0 12.36 0 10.76 0 9.3.69 8.28 1.78L7 3.06 5.72 1.78C4.7.69 3.24 0 1.64 0H0v2h1.64c.88 0 1.71.36 2.32.97L5.5 4.5 3.96 6.03C3.34 5.42 2.5 5 1.64 5H0v2h1.64c.82 0 1.57.33 2.11.87L5 9.13V14h14V9.13l1.25-1.26C20.43 7.33 21.18 7 22 7h2V5h-4zm-8 8H8v-2h4v2zm0-4H8V8h4v2z',
      settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
    };
    return icons[icon] ?? icons['settings'];
  }

  loadCategories(): void {
    this.loading = true;
    this.forumService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.forumService.getPostCountsPerCategory().subscribe({
          next: (counts) => {
            this.postCounts = counts;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMsg = "Impossible de charger les catégories du forum.";
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingCategory = null;
    this.name = '';
    this.description = '';
    this.icon = 'settings';
    this.color = 'blue';
    this.showModal = true;
  }

  openEditModal(cat: ForumCategory): void {
    this.editingCategory = cat;
    this.name = cat.name;
    this.description = cat.description;
    this.icon = cat.icon;
    this.color = cat.color;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
  }

  saveCategory(): void {
    if (!this.name.trim()) {
      this.showError("Le nom de la catégorie est obligatoire.");
      return;
    }

    const payload: ForumCategory = {
      name: this.name.trim(),
      description: this.description.trim(),
      icon: this.icon,
      color: this.color
    };

    this.saving = true;

    if (this.editingCategory && this.editingCategory.id) {
      // Update
      this.forumService.updateCategory(this.editingCategory.id, payload).subscribe({
        next: () => {
          this.showSuccess("Catégorie mise à jour avec succès !");
          this.saving = false;
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.showError(err.error?.message || "Erreur lors de la modification de la catégorie.");
          this.saving = false;
        }
      });
    } else {
      // Create
      this.forumService.createCategory(payload).subscribe({
        next: () => {
          this.showSuccess("Catégorie créée avec succès !");
          this.saving = false;
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.showError(err.error?.message || "Erreur lors de la création de la catégorie.");
          this.saving = false;
        }
      });
    }
  }

  deleteCategory(cat: ForumCategory): void {
    if (!cat.id || !confirm(`Voulez-vous vraiment supprimer la catégorie "${cat.name}" ? Tous les posts associés seront définitivement supprimés.`)) return;
    
    this.forumService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.showSuccess("Catégorie supprimée avec succès !");
        this.loadCategories();
      },
      error: () => this.showError("Erreur lors de la suppression de la catégorie.")
    });
  }

  getPostCount(catId?: number): number {
    if (!catId) return 0;
    return this.postCounts[catId] || 0;
  }

  getColorClass(color: string): string {
    return `badge--${color}`;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
