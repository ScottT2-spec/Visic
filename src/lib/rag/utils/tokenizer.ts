/**
 * AfroStore RAG Engine — Token Estimation
 *
 * Fast token count estimation without importing tiktoken.
 * Uses the ~4 chars per token heuristic for English text,
 * validated against OpenAI's tokenizer. Accurate within 10%.
 *
 * For production billing, use actual token counts from API responses.
 */

const CHARS_PER_TOKEN = 4;

/** Estimate token count for a string */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Estimate token count for multiple strings */
export function estimateTokensBatch(texts: string[]): number {
  return texts.reduce((sum, t) => sum + estimateTokens(t), 0);
}

/** Truncate text to approximately maxTokens */
export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;

  // Try to truncate at a sentence boundary
  const truncated = text.slice(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('. ');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = Math.max(lastPeriod, lastNewline);

  if (cutPoint > maxChars * 0.7) {
    return truncated.slice(0, cutPoint + 1).trim();
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.8) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
}
