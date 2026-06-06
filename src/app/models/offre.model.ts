export type OffreType = 'STAGE' | 'EMPLOI' | 'APPRENTISSAGE' | 'PORTFOLIO' | 'CV';

export type OffreStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

export interface Offre {
  idOffre?: number;
  titre: string;
  description: string;
  typeOffre: OffreType;
  localisation?: string;
  statutOfrre?: OffreStatus;
  datePublication?: string;
  entrepriseId: number;
  entrepriseNom?: string;
  domaine?: string;
  competencesRequises?: string[];
  applicationsCount?: number;
}

export interface OffreRequest {
  titre: string;
  description: string;
  typeOffre: OffreType;
  localisation?: string;
  domaine?: string;
  competencesRequises?: string[];
  entrepriseId: number;
}
