import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { ForumGroup, ForumGroupMember, ForumPost, ForumCategory } from '../../models/forum-client.models';
import { ForumClientService } from '../../services/forum-client.service';
import { ViewModeService } from '../../../../shared/layout/services/view-mode.service';

@Component({
  selector: 'app-forum-group-detail',
  templateUrl: './forum-group-detail.component.html',
  styleUrls: ['./forum-group-detail.component.css']
})
export class ForumGroupDetailComponent implements OnInit, OnDestroy {
  groupId!: number;
  group?: ForumGroup;
  members: ForumGroupMember[] = [];
  pendingMembers: ForumGroupMember[] = [];
  posts: ForumPost[] = [];
  categories: ForumCategory[] = [];

  // Current user info
  currentUserEmail = '';
  currentUserName = '';
  currentUserRole = 'MEMBER';
  isApprovedMember = false;
  isPendingMember = false;
  isOwnerOrModerator = false;

  // Tabs
  activeSubTab: 'discussions' | 'members' | 'moderation' = 'discussions';

  // State
  loading = false;
  loadingPosts = false;
  loadingMembers = false;
  loadingPending = false;
  submittingPost = false;

  // New Post Form
  showPostModal = false;
  postTitle = '';
  postContent = '';
  selectedCategoryId?: number;
  postError = '';

  private routeSub?: Subscription;
  private modeSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ForumClientService,
    private readonly viewMode: ViewModeService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.groupId = +params['id'];
      this.refreshAll();
    });

    this.modeSub = this.viewMode.currentMode$.subscribe(() => {
      this.refreshAll();
    });

    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.modeSub) this.modeSub.unsubscribe();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Erreur chargement categories', err)
    });
  }

  getCurrentUserInfo(): void {
    const mode = this.viewMode.getCurrentMode();
    if (mode === 'alumni') {
      this.currentUserEmail = 'alumni.demo@esprit.tn';
      this.currentUserName = 'Alumni Demo';
    } else if (mode === 'student') {
      this.currentUserEmail = 'etudiant.demo@esprit.tn';
      this.currentUserName = 'Étudiant Demo';
    } else {
      this.currentUserEmail = 'admin.connect@esprit.tn';
      this.currentUserName = 'Admin Esprit';
    }
  }

  refreshAll(): void {
    this.getCurrentUserInfo();
    this.loadGroupDetails();
  }

  loadGroupDetails(): void {
    this.loading = true;
    this.api.getGroupById(this.groupId).subscribe({
      next: (g) => {
        this.group = g;
        this.checkUserRoleAndMembership();
      },
      error: (err) => {
        console.error('Erreur chargement groupe', err);
        this.loading = false;
        alert('Impossible de charger les détails du groupe.');
        this.router.navigate(['/user/forum/groups']);
      }
    });
  }

  checkUserRoleAndMembership(): void {
    this.api.getUserMemberships(this.currentUserEmail).subscribe({
      next: (memberships) => {
        const matching = memberships.find(m => m.group.id === this.groupId);
        if (matching) {
          this.isApprovedMember = matching.status === 'APPROVED';
          this.isPendingMember = matching.status === 'PENDING';
          this.currentUserRole = matching.role;
          this.isOwnerOrModerator = matching.role === 'OWNER' || matching.role === 'MODERATOR';
        } else {
          this.isApprovedMember = false;
          this.isPendingMember = false;
          this.currentUserRole = 'MEMBER';
          this.isOwnerOrModerator = false;
        }

        this.loading = false;

        // Si l'utilisateur est membre approuvé, charger les posts et les membres
        if (this.isApprovedMember || !this.group?.private) {
          this.loadPosts();
          this.loadMembers();
          if (this.isOwnerOrModerator) {
            this.loadPendingMembers();
          }
        }
      },
      error: (err) => {
        console.error('Erreur adhésion', err);
        this.loading = false;
      }
    });
  }

  loadPosts(): void {
    this.loadingPosts = true;
    this.api.getPosts({ groupId: this.groupId })
      .pipe(finalize(() => this.loadingPosts = false))
      .subscribe({
        next: (res) => (this.posts = res),
        error: (err) => console.error('Erreur chargement posts du groupe', err)
      });
  }

  loadMembers(): void {
    this.loadingMembers = true;
    this.api.getGroupMembers(this.groupId)
      .pipe(finalize(() => this.loadingMembers = false))
      .subscribe({
        next: (res) => (this.members = res),
        error: (err) => console.error('Erreur membres du groupe', err)
      });
  }

  loadPendingMembers(): void {
    this.loadingPending = true;
    this.api.getPendingMemberships(this.groupId, this.currentUserEmail)
      .pipe(finalize(() => this.loadingPending = false))
      .subscribe({
        next: (res) => (this.pendingMembers = res),
        error: (err) => console.error('Erreur demandes adhésion', err)
      });
  }

  joinGroup(): void {
    if (!this.group) return;
    this.api.joinGroup(this.groupId, this.currentUserEmail, this.currentUserName).subscribe({
      next: (m) => {
        this.refreshAll();
        if (m.status === 'APPROVED') {
          alert(`Vous avez rejoint le groupe "${this.group?.name}".`);
        } else {
          alert(`Votre demande d'adhésion pour le groupe privé "${this.group?.name}" a été soumise.`);
        }
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erreur lors de la demande d\'adhésion.');
      }
    });
  }

  leaveGroup(): void {
    if (!confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) return;
    this.api.leaveGroup(this.groupId, this.currentUserEmail).subscribe({
      next: () => {
        alert('Vous avez quitté le groupe.');
        this.router.navigate(['/user/forum/groups']);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erreur lors de la tentative de départ.');
      }
    });
  }

  approveMember(memberId: number): void {
    this.api.approveMembership(this.groupId, memberId, this.currentUserEmail).subscribe({
      next: () => {
        this.loadPendingMembers();
        this.loadMembers();
        alert('Membre approuvé avec succès.');
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'approbation.');
      }
    });
  }

  rejectMember(memberId: number): void {
    this.api.rejectMembership(this.groupId, memberId, this.currentUserEmail).subscribe({
      next: () => {
        this.loadPendingMembers();
        alert('Demande rejetée avec succès.');
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors du rejet.');
      }
    });
  }

  openPostModal(): void {
    this.postTitle = '';
    this.postContent = '';
    this.selectedCategoryId = this.categories[0]?.id;
    this.postError = '';
    this.showPostModal = true;
  }

  closePostModal(): void {
    this.showPostModal = false;
  }

  submitPost(): void {
    if (!this.postTitle.trim() || !this.postContent.trim() || !this.selectedCategoryId) {
      this.postError = 'Tous les champs marqués d\'une étoile sont obligatoires.';
      return;
    }

    const mode = this.viewMode.getCurrentMode();
    let authorRole: 'ETUDIANT' | 'ALUMNI' | 'ENSEIGNANT' | 'ADMIN' = 'ETUDIANT';
    if (mode === 'alumni') authorRole = 'ALUMNI';
    if (mode === 'admin') authorRole = 'ADMIN';

    this.submittingPost = true;
    this.postError = '';

    const payload: Partial<ForumPost> = {
      title: this.postTitle.trim(),
      content: this.postContent.trim(),
      category: { id: this.selectedCategoryId } as any,
      authorName: this.currentUserName,
      authorEmail: this.currentUserEmail,
      authorRole: authorRole,
      forumGroup: { id: this.groupId } as any
    };

    this.api.createPost(payload)
      .pipe(finalize(() => this.submittingPost = false))
      .subscribe({
        next: () => {
          this.closePostModal();
          this.loadPosts();
          alert('Votre sujet a été publié avec succès.');
        },
        error: (err) => {
          console.error(err);
          this.postError = err.error?.message || 'Erreur lors de la création du post.';
        }
      });
  }

  goToPostDetail(postId: number): void {
    this.router.navigate(['/user/forum/posts', postId]);
  }
}
