export type UserEventStatus = 'ACTIVE' | 'UPCOMING' | 'CANCELLED' | 'COMPLETED';

export interface UserEvent {
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
  typeEvenementId?: number;
  type?: string | null;
  entrepriseId?: number | null;
  entrepriseNom?: string | null;
  imageUrl?: string | null;
  status: UserEventStatus;
  participated?: boolean;
  ownedByCurrentUser?: boolean;
  ownerNom?: string | null;
}

export interface UserParticipation {
  idParticipation: number;
  evenementId: number;
  createdAt: string;
  evenement: UserEvent;
}

export interface UserEventFilters {
  search?: string;
  type?: string;
}
