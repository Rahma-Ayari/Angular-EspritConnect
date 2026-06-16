import { Component, OnInit } from '@angular/core';
import { UserApprovalService } from '../../../../services/user-approval.service';
import { User, UserApprovalStats, ApprovalSettings, NewUserRequest, SmartMailingSettings, NotificationMode } from '../../../../models/user.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-approvals',
  templateUrl: './user-approvals.component.html',
  styleUrls: ['./user-approvals.component.css']
})
export class UserApprovalsComponent implements OnInit {
  users: User[] = [];
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: Set<string> = new Set();
  stats: UserApprovalStats | null = null;
  
  searchQuery: string = '';
  selectedRole: string = '';
  activeTab: string = 'pending';
  
  isLoading: boolean = false;
  error: string | null = null;

  showApprovedUsers: boolean = false;
  sortField: string = 'registrationDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  itemsPerPage: number = 10;
  currentPage: number = 1;

  settings: ApprovalSettings = {
    autoApproveEspritEmails: true,
    emailNotificationsOnNewRegistration: true,
    requireEmailVerification: false,
    notifyUserOnApproval: true,
    notifyUserOnDecline: true,
    autoApproveDomain: 'esprit.tn'
  };
  settingsLoading: boolean = false;
  settingsSaved: boolean = false;

  // Smart Mailing Settings
  smartMailingSettings: SmartMailingSettings = {
    enabled: true,
    batchThreshold: 5,
    batchWindowMinutes: 30,
    notificationMode: 'SMART',
    dailyDigestHour: 8,
    prioritizeEnterprise: true,
    prioritizeAlumni: false,
    smartThresholdPerHour: 10,
    dashboardNotificationsEnabled: true
  };
  smartMailingLoading: boolean = false;
  smartMailingSaved: boolean = false;
  pendingNotificationsCount: number = 0;
  processingNotifications: boolean = false;
  notificationModes: { value: NotificationMode; label: string; description: string }[] = [
    { value: 'IMMEDIATE', label: 'Immédiat', description: 'Un email est envoyé pour chaque nouvelle inscription' },
    { value: 'BATCHED', label: 'Groupé', description: 'Les emails sont regroupés après un certain nombre d\'inscriptions' },
    { value: 'HOURLY_DIGEST', label: 'Résumé horaire', description: 'Un email récapitulatif est envoyé toutes les heures' },
    { value: 'DAILY_DIGEST', label: 'Résumé quotidien', description: 'Un email récapitulatif est envoyé une fois par jour' },
    { value: 'SMART', label: 'Intelligent (recommandé)', description: 'Le système adapte automatiquement le mode selon le volume d\'inscriptions' }
  ];

  // Add Users Tab properties
  newUser: NewUserRequest = {
    nom: '',
    email: '',
    role: 'ETUDIANT',
    affiliation: ''
  };
  addUserLoading: boolean = false;
  addUserSuccess: boolean = false;
  addUserError: string | null = null;

  // Import Users properties
  importFile: File | null = null;
  importPreview: NewUserRequest[] = [];
  importErrors: string[] = [];
  isImporting: boolean = false;
  importSuccess: boolean = false;
  importResultMessage: string = '';
  showImportPreview: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(private userApprovalService: UserApprovalService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadStats();
    this.loadSettings();
    this.loadSmartMailingSettings();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.activeTab === 'pending') {
        this.applyPendingFilters();
      } else if (this.activeTab === 'list-tools') {
        this.applyFilters();
      }
    });
  }

  loadPendingUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userApprovalService.getPendingUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyPendingFilters();
        this.isLoading = false;
        this.loadStats();
      },
      error: (err) => {
        this.error = 'Failed to load pending users';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadAllUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userApprovalService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadStats(): void {
    this.userApprovalService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    if (this.activeTab === 'pending') {
      this.applyPendingFilters();
    } else if (this.activeTab === 'list-tools') {
      this.applyFilters();
    }
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.selectedUsers.clear();
    this.searchQuery = '';
    this.selectedRole = '';
    this.currentPage = 1;
    
    if (tab === 'pending') {
      this.loadPendingUsers();
    } else if (tab === 'list-tools') {
      this.showApprovedUsers = true;
      this.loadAllUsers();
    }
  }

  applyPendingFilters(): void {
    let filtered = [...this.users];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.nom.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) ||
        (u.affiliation && u.affiliation.toLowerCase().includes(query))
      );
    }
    
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    this.filteredUsers = filtered;
  }

  applyFilters(): void {
    let filtered = [...this.allUsers];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.nom.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) ||
        (u.affiliation && u.affiliation.toLowerCase().includes(query))
      );
    }
    
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    if (!this.showApprovedUsers) {
      filtered = filtered.filter(u => u.status === 'Pending');
    }
    
    filtered.sort((a, b) => {
      let valA: any, valB: any;
      
      switch (this.sortField) {
        case 'nom':
          valA = a.nom.toLowerCase();
          valB = b.nom.toLowerCase();
          break;
        case 'email':
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case 'registrationDate':
          valA = new Date(a.registrationDate).getTime();
          valB = new Date(b.registrationDate).getTime();
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        default:
          valA = a.registrationDate;
          valB = b.registrationDate;
      }
      
      if (this.sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    this.filteredUsers = filtered;
  }

  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  toggleShowApproved(): void {
    this.showApprovedUsers = !this.showApprovedUsers;
    this.applyFilters();
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filteredUsers.forEach(user => this.selectedUsers.add(user.id));
    } else {
      this.selectedUsers.clear();
    }
  }

  toggleUserSelection(userId: string): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUsers.has(userId);
  }

  isAllSelected(): boolean {
    return this.filteredUsers.length > 0 && 
           this.filteredUsers.every(user => this.selectedUsers.has(user.id));
  }

  approveUser(user: User): void {
    this.userApprovalService.approveUser(user.id).subscribe({
      next: () => {
        this.removeUserFromList(user.id);
        this.loadStats();
      },
      error: (err) => {
        console.error('Failed to approve user:', err);
        alert('Failed to approve user');
      }
    });
  }

  declineUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir refuser ${user.nom} ?`)) {
      this.userApprovalService.declineUser(user.id).subscribe({
        next: () => {
          this.removeUserFromList(user.id);
          this.loadStats();
        },
        error: (err) => {
          console.error('Failed to decline user:', err);
          alert('Failed to decline user');
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.nom} ? Cette action est irréversible.`)) {
      this.userApprovalService.deleteUser(user.id).subscribe({
        next: () => {
          this.removeUserFromList(user.id);
          this.loadStats();
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
          alert('Failed to delete user');
        }
      });
    }
  }

  bulkApprove(): void {
    if (this.selectedUsers.size === 0) return;
    
    const userIds = Array.from(this.selectedUsers);
    this.userApprovalService.bulkApprove(userIds).subscribe({
      next: () => {
        userIds.forEach(id => this.removeUserFromList(id));
        this.selectedUsers.clear();
        this.loadStats();
      },
      error: (err) => {
        console.error('Failed to bulk approve:', err);
        alert('Failed to approve selected users');
      }
    });
  }

  bulkDecline(): void {
    if (this.selectedUsers.size === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir refuser ${this.selectedUsers.size} utilisateurs ?`)) {
      const userIds = Array.from(this.selectedUsers);
      this.userApprovalService.bulkDecline(userIds).subscribe({
        next: () => {
          userIds.forEach(id => this.removeUserFromList(id));
          this.selectedUsers.clear();
          this.loadStats();
        },
        error: (err) => {
          console.error('Failed to bulk decline:', err);
          alert('Failed to decline selected users');
        }
      });
    }
  }

  exportUsers(): void {
    const dataToExport = this.filteredUsers.map(u => ({
      Nom: u.nom,
      Email: u.email,
      Role: u.role,
      Affiliation: u.affiliation,
      'Date Inscription': this.formatDate(u.registrationDate),
      Status: u.status
    }));
    
    const csv = this.convertToCSV(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => `"${obj[h] || ''}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  private removeUserFromList(userId: string): void {
    this.users = this.users.filter(u => u.id !== userId);
    this.allUsers = this.allUsers.filter(u => u.id !== userId);
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== userId);
    this.selectedUsers.delete(userId);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getAffiliationParts(affiliation: string): { type: string; domain: string | null } {
    if (!affiliation) return { type: 'Unknown', domain: null };
    const parts = affiliation.split(' - ');
    return {
      type: parts[0],
      domain: parts.length > 1 ? parts[1] : null
    };
  }

  getAffiliationTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'student': return 'type-student';
      case 'alumni': return 'type-alumni';
      case 'enterprise': return 'type-enterprise';
      default: return '';
    }
  }

  itemsPerPageOptions = [5, 10, 25, 50];

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  loadSettings(): void {
    this.userApprovalService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
      },
      error: (err) => {
        console.error('Failed to load settings:', err);
      }
    });
  }

  saveSettings(): void {
    this.settingsLoading = true;
    this.settingsSaved = false;
    this.settings.autoApproveDomain = (this.settings.autoApproveDomain || '')
      .trim()
      .replace(/^@+/, '');

    this.userApprovalService.updateSettings(this.settings).subscribe({
      next: (updatedSettings) => {
        this.settings = updatedSettings;
        this.settingsLoading = false;
        this.settingsSaved = true;
        
        setTimeout(() => {
          this.settingsSaved = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to save settings:', err);
        this.settingsLoading = false;
        alert('Failed to save settings. Please try again.');
      }
    });
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.settingsLoading = true;
      
      this.userApprovalService.resetSettings().subscribe({
        next: (defaultSettings) => {
          this.settings = defaultSettings;
          this.settingsLoading = false;
          this.settingsSaved = true;
          
          setTimeout(() => {
            this.settingsSaved = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to reset settings:', err);
          this.settingsLoading = false;
          alert('Failed to reset settings. Please try again.');
        }
      });
    }
  }

  onSettingChange(): void {
    this.settingsSaved = false;
  }

  // Smart Mailing Methods
  loadSmartMailingSettings(): void {
    this.userApprovalService.getSmartMailingSettings().subscribe({
      next: (settings) => {
        this.smartMailingSettings = settings;
        this.loadPendingNotificationsCount();
      },
      error: (err) => {
        console.error('Failed to load smart mailing settings:', err);
      }
    });
  }

  loadPendingNotificationsCount(): void {
    this.userApprovalService.getPendingNotificationsCount().subscribe({
      next: (result) => {
        this.pendingNotificationsCount = result.count;
      },
      error: (err) => {
        console.error('Failed to load pending notifications count:', err);
      }
    });
  }

  saveSmartMailingSettings(): void {
    this.smartMailingLoading = true;
    this.smartMailingSaved = false;
    
    this.userApprovalService.updateSmartMailingSettings(this.smartMailingSettings).subscribe({
      next: (updatedSettings) => {
        this.smartMailingSettings = updatedSettings;
        this.smartMailingLoading = false;
        this.smartMailingSaved = true;
        
        setTimeout(() => {
          this.smartMailingSaved = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to save smart mailing settings:', err);
        this.smartMailingLoading = false;
        alert('Failed to save smart mailing settings. Please try again.');
      }
    });
  }

  processNotificationsNow(): void {
    if (this.pendingNotificationsCount === 0) return;
    
    this.processingNotifications = true;
    
    this.userApprovalService.processNotificationsNow().subscribe({
      next: () => {
        this.processingNotifications = false;
        this.loadPendingNotificationsCount();
        alert('Notifications processed successfully!');
      },
      error: (err) => {
        console.error('Failed to process notifications:', err);
        this.processingNotifications = false;
        alert('Failed to process notifications. Please try again.');
      }
    });
  }

  onSmartMailingSettingChange(): void {
    this.smartMailingSaved = false;
  }

  getNotificationModeLabel(mode: NotificationMode): string {
    const modeObj = this.notificationModes.find(m => m.value === mode);
    return modeObj ? modeObj.label : mode;
  }

  // Add Single User Methods
  addUser(): void {
    if (!this.validateNewUser()) {
      return;
    }

    this.addUserLoading = true;
    this.addUserError = null;
    this.addUserSuccess = false;

    this.userApprovalService.addUser(this.newUser).subscribe({
      next: (user) => {
        this.addUserLoading = false;
        this.addUserSuccess = true;
        this.resetNewUserForm();
        this.loadStats();
        
        setTimeout(() => {
          this.addUserSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.addUserLoading = false;
        this.addUserError = err.error?.message || 'Échec de l\'ajout de l\'utilisateur. Veuillez réessayer.';
        console.error('Failed to add user:', err);
      }
    });
  }

  validateNewUser(): boolean {
    if (!this.newUser.nom.trim()) {
      this.addUserError = 'Le nom est requis.';
      return false;
    }
    if (!this.newUser.email.trim()) {
      this.addUserError = 'L\'email est requis.';
      return false;
    }
    if (!this.isValidEmail(this.newUser.email)) {
      this.addUserError = 'L\'email n\'est pas valide.';
      return false;
    }
    if (!this.newUser.role) {
      this.addUserError = 'Le rôle est requis.';
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetNewUserForm(): void {
    this.newUser = {
      nom: '',
      email: '',
      role: 'ETUDIANT',
      affiliation: ''
    };
    this.addUserError = null;
  }

  // Import Users Methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.importFile = input.files[0];
      this.importErrors = [];
      this.importSuccess = false;
      this.importResultMessage = '';
      this.parseImportFile();
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.importFile = files[0];
      this.importErrors = [];
      this.importSuccess = false;
      this.importResultMessage = '';
      this.parseImportFile();
    }
  }

  parseImportFile(): void {
    if (!this.importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.processCSV(content);
    };
    reader.onerror = () => {
      this.importErrors = ['Erreur lors de la lecture du fichier.'];
    };
    reader.readAsText(this.importFile);
  }

  processCSV(content: string): void {
    const lines = content.split('\n').filter(line => line.trim());
    this.importPreview = [];
    this.importErrors = [];

    if (lines.length < 2) {
      this.importErrors.push('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données.');
      return;
    }

    const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase());
    const nomIndex = headers.findIndex(h => h === 'nom' || h === 'name' || h === 'fullname');
    const emailIndex = headers.findIndex(h => h === 'email' || h === 'mail');
    const roleIndex = headers.findIndex(h => h === 'role' || h === 'type');
    const affiliationIndex = headers.findIndex(h => h === 'affiliation' || h === 'company' || h === 'organization');

    if (nomIndex === -1 || emailIndex === -1) {
      this.importErrors.push('Le fichier doit contenir les colonnes "nom" et "email".');
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length === 0 || (values.length === 1 && !values[0].trim())) {
        continue;
      }

      const nom = values[nomIndex]?.trim() || '';
      const email = values[emailIndex]?.trim() || '';
      const role = this.normalizeRole(values[roleIndex]?.trim() || 'ETUDIANT');
      const affiliation = affiliationIndex !== -1 ? values[affiliationIndex]?.trim() || '' : '';

      if (!nom) {
        this.importErrors.push(`Ligne ${i + 1}: Le nom est manquant.`);
        continue;
      }
      if (!email) {
        this.importErrors.push(`Ligne ${i + 1}: L'email est manquant.`);
        continue;
      }
      if (!this.isValidEmail(email)) {
        this.importErrors.push(`Ligne ${i + 1}: L'email "${email}" n'est pas valide.`);
        continue;
      }

      this.importPreview.push({ nom, email, role, affiliation });
    }

    this.showImportPreview = this.importPreview.length > 0;
  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  }

  normalizeRole(role: string): 'ETUDIANT' | 'ALUMNI' | 'ENTREPRISE' | 'ENSEIGNANT' | 'ADMIN' {
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case 'ETUDIANT':
      case 'STUDENT':
        return 'ETUDIANT';
      case 'ALUMNI':
        return 'ALUMNI';
      case 'ENTREPRISE':
      case 'ENTERPRISE':
      case 'COMPANY':
        return 'ENTREPRISE';
      case 'ENSEIGNANT':
      case 'TEACHER':
        return 'ENSEIGNANT';
      case 'ADMIN':
        return 'ADMIN';
      default:
        return 'ETUDIANT';
    }
  }

  removeFromPreview(index: number): void {
    this.importPreview.splice(index, 1);
    if (this.importPreview.length === 0) {
      this.showImportPreview = false;
      this.importFile = null;
    }
  }

  cancelImport(): void {
    this.importFile = null;
    this.importPreview = [];
    this.importErrors = [];
    this.showImportPreview = false;
    this.importSuccess = false;
    this.importResultMessage = '';
  }

  confirmImport(): void {
    if (this.importPreview.length === 0) return;

    this.isImporting = true;
    this.importErrors = [];

    this.userApprovalService.bulkAddUsers(this.importPreview).subscribe({
      next: (result) => {
        this.isImporting = false;
        this.importSuccess = true;
        this.importResultMessage = `${result.successCount} utilisateur(s) importé(s) avec succès.`;
        
        if (result.errors && result.errors.length > 0) {
          this.importErrors = result.errors;
        }
        
        this.importPreview = [];
        this.showImportPreview = false;
        this.importFile = null;
        this.loadStats();
        
        setTimeout(() => {
          this.importSuccess = false;
          this.importResultMessage = '';
        }, 5000);
      },
      error: (err) => {
        this.isImporting = false;
        this.importErrors = [err.error?.message || 'Échec de l\'importation. Veuillez réessayer.'];
        console.error('Failed to import users:', err);
      }
    });
  }

  downloadTemplate(): void {
    const template = 'nom,email,role,affiliation\nJean Dupont,jean.dupont@email.com,ETUDIANT,Student - ESPRIT\nMarie Martin,marie.martin@email.com,ALUMNI,Alumni - ESPRIT';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'import_users_template.csv';
    link.click();
  }
}
