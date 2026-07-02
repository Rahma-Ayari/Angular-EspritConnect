/** Backend-only providers — keys never exposed to the browser. */
export type AiProviderLabel = 'Gemini AI' | 'OpenAI';

export function formatProviderLabel(provider?: string): AiProviderLabel | string {
  if (!provider) return 'Gemini AI';
  if (provider.toLowerCase().includes('rule')) return 'Analytics';
  if (provider.toLowerCase().includes('openai')) return 'OpenAI';
  return 'Gemini AI';
}

export function poweredByText(provider?: string): string {
  return `Powered by ${formatProviderLabel(provider)}`;
}
