import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ForumGroup } from '../../../forum-client/models/forum-client.models';
import { ForumClientService } from '../../../forum-client/services/forum-client.service';

@Component({
  selector: 'app-forum-groups-moderation',
  templateUrl: './forum-groups-moderation.component.html',
  styleUrls: ['./forum-groups-moderation.component.css']
})
export class ForumGroupsModerationComponent implements OnInit {
  pendingGroups: ForumGroup[] = [];
  loading = false;

  constructor(private readonly api: ForumClientService) {}

  ngOnInit(): void {
    this.loadPendingGroups();
  }

  loadPendingGroups(): void {
    this.loading = true;
    this.api.getPendingGroups()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (groups) => (this.pendingGroups = groups),
        error: (err) => console.error('Error chargement des groupes en attente', err)
      });
  }

  approveGroup(groupId: number): void {
    if (!confirm('Approve creation of this discussion group?')) return;
    
    this.api.approveGroup(groupId).subscribe({
      next: () => {
        this.loadPendingGroups();
        alert('Le groupe a été approuvé avec succès.');
      },
      error: (err) => {
        console.error(err);
        alert('Error approving group.');
      }
    });
  }

  rejectGroup(groupId: number): void {
    if (!confirm('Reject creation of this discussion group?')) return;

    this.api.rejectGroup(groupId).subscribe({
      next: () => {
        this.loadPendingGroups();
        alert('La demande a été rejetée.');
      },
      error: (err) => {
        console.error(err);
        alert('Error rejecting group.');
      }
    });
  }
}
