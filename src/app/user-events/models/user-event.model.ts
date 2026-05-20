export interface UserEvent {
  idEvenement?: number;
  titre: string;
  lieu: string;
  dateEvenement: string;
  capacite: number;
  type?: string | null;
  entrepriseId: number;
  entrepriseNom?: string | null;
  imageUrl?: string | null;
  status: 'ACTIVE' | 'UPCOMING' | 'CANCELLED' | 'COMPLETED';
}

export interface UserEventFilters {
  search?: string;
  type?: string;
}
