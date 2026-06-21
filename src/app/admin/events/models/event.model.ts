export type EventStatus = 'ACTIVE' | 'UPCOMING' | 'CANCELLED' | 'COMPLETED';

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
  online?: boolean | null;
  nombreParticipants?: number;
  placesRestantes?: number | null;
  waitingListCount?: number;
  typeEvenementId: number;
  type?: string | null;
  entrepriseId?: number | null;
  entrepriseNom?: string | null;
  imageUrl?: string | null;
  status?: EventStatus | null;
  participated?: boolean;
  ownedByCurrentUser?: boolean;
  ownerId?: string;
  ownerNom?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface EventParticipation {
  idParticipation?: number;
  userId?: string;
  userNom?: string | null;
  userEmail?: string | null;
  evenementId?: number;
  createdAt?: string;
  status?: string | null;
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

export interface ArchiveEvent {
  idEvenement: number;
  titre: string;
  type: string | null;
  dateDebut: string;
  dateFin: string;
  entrepriseNom: string | null;
  nombreParticipants: number;
  status: string | null;
}

export interface WaitingListEntry {
  idListeAttente?: number;
  userId?: string;
  userNom?: string | null;
  userEmail?: string | null;
  evenementId?: number;
  evenementTitre?: string | null;
  createdAt?: string;
}

export interface CategorySuggestion {
  category: string;
  interestedUsers: number;
  matches: EventMatch[];
}

export interface EventMatch {
  idEvenement: number;
  titre: string;
  status: string | null;
}

export interface EventSuggestions {
  suggestions: CategorySuggestion[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
