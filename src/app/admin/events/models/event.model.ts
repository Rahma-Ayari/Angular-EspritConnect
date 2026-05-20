export interface Event {

  idEvenement?: number;

  titre: string;

  lieu: string;

  dateEvenement: Date;

  capacite: number;

  type: string;

  entrepriseId: number;

  entrepriseNom?: string;

  imageUrl?: string;

  status?: string;
}
