import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface ForumReply {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

interface ForumPost {
  id?: number;
  title: string;
  content: string;
  category: ForumCategory;
  authorName: string;
  authorEmail: string;
  authorRole: string;
  createdAt?: string;
  viewsCount?: number;
  likesCount?: number;
  replies?: ForumReply[];
  likedByCurrentUser?: boolean;
}

interface StudentMember {
  name: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

@Component({
  selector: 'app-student-forum',
  templateUrl: './student-forum.component.html',
  styleUrls: ['./student-forum.component.css']
})
export class StudentForumComponent implements OnInit {
  private base = `${environment.apiUrl}/forum`;

  // Liste des posts et catégories chargés depuis le backend
  posts: ForumPost[] = [];
  categories: ForumCategory[] = [];
  filteredPosts: ForumPost[] = [];

  // Filters actifs
  selectedCategoryId: number | null = null;
  searchQuery: string = '';
  loading: boolean = false;

  // États du Stepper Modal
  showStepperModal: boolean = false;
  currentStep: number = 1;
  isSubmitting: boolean = false;
  creationSuccess: boolean = false;

  // Template pour le nouveau groupe/discussion
  newGroup = {
    title: '',
    website: '',
    content: '',
    categoryId: null as number | null,
    isPrivate: false,
    allowMemberMentions: true,
    tags: [] as string[],
    members: [] as StudentMember[]
  };

  // Saisie de tags
  tagInput: string = '';

  // Saisie de membres à rechercher/inviter
  memberSearchQuery: string = '';
  suggestedStudents = [
    { name: 'Safa Bennasr', email: 'safa.bennasr@esprit.tn' },
    { name: 'Ahmed Ayedi', email: 'ahmed.ayedi@esprit.tn' },
    { name: 'Sonia Rekik', email: 'sonia.rekik@esprit.tn' },
    { name: 'Mohamed Dridi', email: 'mohamed.dridi@esprit.tn' }
  ];
  showSuggestions: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  // ==========================================
  //         CHARGEMENT DES DONNÉES
  // ==========================================

  loadCategories(): void {
    this.http.get<ForumCategory[]>(`${this.base}/categories`).subscribe({
      next: (data) => {
        this.categories = data;
        // Par défaut, si aucun categoryId n'est assigné au nouveau groupe, prendre le premier
        if (data.length > 0) {
          this.newGroup.categoryId = data[0].id;
        }
      },
      error: (err) => console.error('Error chargement catégories:', err)
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.http.get<ForumPost[]>(`${this.base}/posts`).subscribe({
      next: (data) => {
        // Ajouter un attribut local mock pour les likes
        this.posts = data.map(p => ({
          ...p,
          likesCount: p.likesCount || 0,
          likedByCurrentUser: false
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error chargement posts:', err);
        // Fallback mock en cas de problème de connexion backend
        this.posts = this.getMockPosts();
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.posts];

    if (this.selectedCategoryId !== null) {
      result = result.filter(p => p.category && p.category.id === this.selectedCategoryId);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q)
      );
    }

    this.filteredPosts = result;
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = id;
    this.applyFilters();
  }

  // ==========================================
  //             INTERACTIONS
  // ==========================================

  likePost(post: ForumPost): void {
    if (post.likedByCurrentUser) {
      post.likesCount = (post.likesCount || 1) - 1;
      post.likedByCurrentUser = false;
    } else {
      post.likesCount = (post.likesCount || 0) + 1;
      post.likedByCurrentUser = true;
    }
  }

  // ==========================================
  //           STEPPER FORM LOGIC
  // ==========================================

  openCreateModal(): void {
    this.showStepperModal = true;
    this.currentStep = 1;
    this.creationSuccess = false;
    this.resetForm();
  }

  closeCreateModal(): void {
    this.showStepperModal = false;
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  resetForm(): void {
    this.newGroup = {
      title: '',
      website: '',
      content: '',
      categoryId: this.categories.length > 0 ? this.categories[0].id : null,
      isPrivate: false,
      allowMemberMentions: true,
      tags: [],
      members: []
    };
    this.tagInput = '';
    this.memberSearchQuery = '';
  }

  // --- Gestion Étape 2 (Tags) ---
  addTag(): void {
    const val = this.tagInput.trim().replace('#', '');
    if (val && !this.newGroup.tags.includes(val)) {
      this.newGroup.tags.push(val);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.newGroup.tags = this.newGroup.tags.filter(t => t !== tag);
  }

  // --- Gestion Étape 3 (Members) ---
  filterSuggestions(): void {
    this.showSuggestions = this.memberSearchQuery.trim().length > 0;
  }

  addMember(student: { name: string, email: string }): void {
    const exists = this.newGroup.members.some(m => m.email === student.email);
    if (!exists) {
      this.newGroup.members.push({
        name: student.name,
        email: student.email,
        role: 'MEMBER'
      });
    }
    this.memberSearchQuery = '';
    this.showSuggestions = false;
  }

  removeMember(email: string): void {
    this.newGroup.members = this.newGroup.members.filter(m => m.email !== email);
  }

  // --- Soumission finale ---
  submitGroup(): void {
    if (!this.newGroup.title.trim()) return;

    this.isSubmitting = true;

    // Récupérer la catégorie complète
    const category = this.categories.find(c => c.id === this.newGroup.categoryId) || this.categories[0];

    // Mettre en forme le contenu avec les informations saisies dans le stepper
    let formattedContent = `<p>${this.newGroup.content}</p>`;
    if (this.newGroup.website) {
      formattedContent += `<p><strong>Site Web :</strong> <a href="${this.newGroup.website}" target="_blank">${this.newGroup.website}</a></p>`;
    }
    if (this.newGroup.tags.length > 0) {
      formattedContent += `<div style="margin-top: 10px;">` + 
        this.newGroup.tags.map(t => `<span class="badge-tag">#${t}</span>`).join(' ') +
        `</div>`;
    }
    if (this.newGroup.members.length > 0) {
      formattedContent += `<div style="margin-top: 15px; font-size: 13px; color: #555;">` +
        `<strong>Members invités :</strong> ` + 
        this.newGroup.members.map(m => `${m.name} (${m.role})`).join(', ') + 
        `</div>`;
    }

    const payload = {
      title: this.newGroup.title,
      content: formattedContent,
      category: { id: category.id },
      authorName: 'Student Esprit',
      authorEmail: 'student.connect@esprit.tn',
      authorRole: 'ETUDIANT',
      pinned: false,
      reported: false
    };

    this.http.post<ForumPost>(`${this.base}/posts`, payload).subscribe({
      next: (createdPost) => {
        // Ajouter localement le post créé à la liste
        this.posts.unshift({
          ...createdPost,
          likesCount: 0,
          likedByCurrentUser: false
        });
        this.applyFilters();
        this.isSubmitting = false;
        this.creationSuccess = true;
      },
      error: (err) => {
        console.error('Error création post:', err);
        // Simulation locale si le backend n'a pas répondu
        this.posts.unshift({
          id: Date.now(),
          title: this.newGroup.title,
          content: formattedContent,
          category: category,
          authorName: 'Student Esprit',
          authorEmail: 'student.connect@esprit.tn',
          authorRole: 'ETUDIANT',
          createdAt: new Date().toISOString(),
          viewsCount: 1,
          likesCount: 0,
          replies: []
        });
        this.applyFilters();
        this.isSubmitting = false;
        this.creationSuccess = true;
      }
    });
  }

  // ==========================================
  //            DONNÉES MOCKÉES
  // ==========================================

  getMockPosts(): ForumPost[] {
    return [
      {
        id: 1,
        title: 'Groupe d\'étude Réseaux de Neurones et Deep Learning',
        content: 'Bonjour à tous ! Nous créons un groupe d\'entraide pour le cours de Deep Learning. L\'objectif est de réviser les TD et de collaborer sur le projet de fin de semestre.',
        category: { id: 1, name: 'Software Engineering', color: 'blue' },
        authorName: 'Ahmed Ayedi',
        authorEmail: 'ahmed@esprit.tn',
        authorRole: 'ETUDIANT',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        viewsCount: 42,
        likesCount: 5,
        replies: []
      },
      {
        id: 2,
        title: 'Prébyation des entretiens pour l\'Apprenticeship 2026',
        content: 'Partage de ressources, questions classiques de codage (Leetcode) et simulations d\'entretiens techniques pour décrocher une alternance en cycle d\'ingénieur.',
        category: { id: 2, name: 'Apprenticeship', color: 'green' },
        authorName: 'Safa Bennasr',
        authorEmail: 'safa@esprit.tn',
        authorRole: 'ETUDIANT',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        viewsCount: 110,
        likesCount: 12,
        replies: []
      }
    ];
  }
}
