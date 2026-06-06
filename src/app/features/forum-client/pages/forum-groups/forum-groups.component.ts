import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { ForumGroup, ForumGroupMember } from '../../models/forum-client.models';
import { ForumClientService } from '../../services/forum-client.service';
import { ViewModeService } from '../../../../shared/layout/services/view-mode.service';

@Component({
  selector: 'app-forum-groups',
  templateUrl: './forum-groups.component.html',
  styleUrls: ['./forum-groups.component.css']
})
export class ForumGroupsComponent implements OnInit, OnDestroy {
  activeTab: 'explore' | 'my-groups' = 'explore';
  activeGroups: ForumGroup[] = [];
  myGroups: ForumGroup[] = [];
  memberships: { [groupId: number]: ForumGroupMember } = {};

  searchText = '';
  loading = false;
  saving = false;

  showCreateModal = false;
  groupName = '';
  groupDescription = '';
  isPrivate = false;
  errorMsg = '';

  private modeSub?: Subscription;

  constructor(
    private readonly api: ForumClientService,
    public readonly viewMode: ViewModeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.modeSub = this.viewMode.currentMode$.subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy(): void {
    if (this.modeSub) {
      this.modeSub.unsubscribe();
    }
  }

  getCurrentUserEmail(): string {
    const mode = this.viewMode.getCurrentMode();
    if (mode === 'alumni') return 'alumni.demo@esprit.tn';
    if (mode === 'student') return 'etudiant.demo@esprit.tn';
    return 'admin.connect@esprit.tn';
  }

  getCurrentUserName(): string {
    const mode = this.viewMode.getCurrentMode();
    if (mode === 'alumni') return 'Alumni Demo';
    if (mode === 'student') return 'Étudiant Demo';
    return 'Admin Esprit';
  }

  refreshData(): void {
    this.loading = true;
    const email = this.getCurrentUserEmail();

    // Charger les groupes actifs, mes groupes et mes adhésions
    this.api.getActiveGroups().subscribe({
      next: (groups) => {
        this.activeGroups = groups;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement groupes actifs', err);
        this.loading = false;
      }
    });

    this.api.getMyGroups(email).subscribe({
      next: (groups) => {
        this.myGroups = groups;
      },
      error: (err) => console.error('Erreur chargement mes groupes', err)
    });

    this.api.getUserMemberships(email).subscribe({
      next: (res) => {
        this.memberships = {};
        res.forEach(m => {
          if (m.group && m.group.id) {
            this.memberships[m.group.id] = m;
          }
        });
      },
      error: (err) => console.error('Erreur chargement adhésions', err)
    });
  }

  getFilteredActiveGroups(): ForumGroup[] {
    if (!this.searchText.trim()) {
      return this.activeGroups;
    }
    const q = this.searchText.toLowerCase();
    return this.activeGroups.filter(g => 
      g.name.toLowerCase().includes(q) || 
      (g.description && g.description.toLowerCase().includes(q))
    );
  }

  getFilteredMyGroups(): ForumGroup[] {
    if (!this.searchText.trim()) {
      return this.myGroups;
    }
    const q = this.searchText.toLowerCase();
    return this.myGroups.filter(g => 
      g.name.toLowerCase().includes(q) || 
      (g.description && g.description.toLowerCase().includes(q))
    );
  }

  openCreate(): void {
    this.groupName = '';
    this.groupDescription = '';
    this.isPrivate = false;
    this.errorMsg = '';
    this.showCreateModal = true;
  }

  closeCreate(): void {
    this.showCreateModal = false;
  }

  submitGroup(): void {
    if (!this.groupName.trim()) {
      this.errorMsg = 'Le nom du groupe est obligatoire.';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    
    const payload: Partial<ForumGroup> = {
      name: this.groupName.trim(),
      description: this.groupDescription.trim(),
      private: this.isPrivate,
      creatorEmail: this.getCurrentUserEmail(),
      creatorName: this.getCurrentUserName()
    };

    this.api.createGroup(payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.closeCreate();
          this.refreshData();
          alert('Votre demande de création de groupe a été soumise avec succès et est en attente de validation par l\'administration.');
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = err.error?.message || 'Erreur lors de la création du groupe.';
        }
      });
  }

  joinGroup(group: ForumGroup, event: MouseEvent): void {
    event.stopPropagation();
    if (!group.id) return;

    this.api.joinGroup(group.id, this.getCurrentUserEmail(), this.getCurrentUserName()).subscribe({
      next: (m) => {
        this.refreshData();
        if (m.status === 'APPROVED') {
          alert(`Félicitations ! Vous avez rejoint le groupe "${group.name}".`);
        } else {
          alert(`Votre demande d'adhésion pour le groupe privé "${group.name}" est en attente d'approbation par son modérateur.`);
        }
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erreur lors de la tentative d\'adhésion.');
      }
    });
  }

  visitGroup(groupId: number): void {
    this.router.navigate(['/user/forum/groups', groupId]);
  }
}
