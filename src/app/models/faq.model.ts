export interface FAQ {
  id: number;
  question: string;
  answer: string;
  categoryId?: number;
  categoryName?: string;
  category?: {
    id: number;
    name: string;
  };
  isImportant: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQRequest {
  question: string;
  answer: string;
  categoryId?: number | null;
  isImportant?: boolean;
}
