export type EventStatus = 'ACTIVE' | 'UPCOMING' | 'CANCELLED' | 'COMPLETED';

export interface Event {
  idEvenement?: number;
  titre: string;
  lieu: string;
  dateEvenement: string;
  capacite: number;
  type?: string | null;
  entrepriseId: number;
  entrepriseNom?: string | null;
  imageUrl?: string | null;
  status: EventStatus;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  cancelledEvents: number;
  completedEvents: number;
  totalCapacity: number;
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
