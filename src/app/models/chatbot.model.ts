export interface ChatbotHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotResponse {
  response: string;
  suggestedFaqs?: any[];
  ticketSuggest?: boolean;
  aiPowered?: boolean;
}
