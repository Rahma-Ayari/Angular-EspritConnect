export type EventStatus = 'ACTIVE' | 'UPCOMING' | 'CANCELLED' | 'COMPLETED';
export type EventApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EventType {
  idTypeEvenement?: number;
  nom: string;
  description?: string | null;
  actif?: boolean;
}

export interface Event {
  idEvenement?: number;
  titre: string;
  lieu: string;
  dateEvenement?: string;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes?: number;
  capacite?: number | null;
  unlimitedParticipants: boolean;
  nombreParticipants?: number;
  placesRestantes?: number | null;
  typeEvenementId: number;
  type?: string | null;
  entrepriseId?: number | null;
  entrepriseNom?: string | null;
  imageUrl?: string | null;
  status: EventStatus;
  participated?: boolean;
  ownedByCurrentUser?: boolean;
  ownerId?: string;
  ownerNom?: string | null;
  approvalStatus?: EventApprovalStatus | null;
  rejectionReason?: string | null;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  cancelledEvents: number;
  completedEvents: number;
  totalCapacity: number;
  totalParticipants: number;
  participationRate: number;
}

export interface EventFilters {
  search?: string;
  status?: string;
  type?: string;
}

export interface EntrepriseOption {
  idEntreprise: number;
  nom: string;
  email?: string;
}
