/**
 * AfroStore RAG Engine — Text Normalization
 *
 * Clean, normalize, and prepare text for indexing and search.
 * Handles common African commerce text patterns.
 */

/** Normalize text for consistent indexing */
export function normalizeText(text: string): string {
  return text
    // Normalize Unicode (NFC form)
    .normalize('NFC')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Normalize dashes
    .replace(/[–—]/g, '-')
    .trim();
}

/** Normalize for search queries (more aggressive) */
export function normalizeQuery(query: string): string {
  return normalizeText(query)
    .toLowerCase()
    // Remove common filler words for search
    .replace(/\b(please|can you|could you|i want to|i need to|help me)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract key terms from text for BM25 boost */
export function extractKeyTerms(text: string): string[] {
  const normalized = normalizeText(text).toLowerCase();
  const words = normalized.split(/\s+/);

  // Filter stop words
  const filtered = words.filter(
    (w) => w.length > 2 && !STOP_WORDS.has(w)
  );

  // Deduplicate
  return [...new Set(filtered)];
}

/** Format currency for search (handle ₦, GHS, KES, etc.) */
export function normalizeCurrency(text: string): string {
  return text
    .replace(/₦/g, 'NGN ')
    .replace(/GH₵/g, 'GHS ')
    .replace(/KSh/g, 'KES ')
    .replace(/R\s/g, 'ZAR ')
    .replace(/\$/g, 'USD ');
}

/** Clean HTML tags from content */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build searchable text from structured data */
export function buildSearchableText(fields: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string' && value.trim()) {
      parts.push(value.trim());
    } else if (typeof value === 'number') {
      parts.push(String(value));
    } else if (Array.isArray(value)) {
      const stringVals = value
        .filter((v) => typeof v === 'string' && v.trim())
        .map((v) => (v as string).trim());
      if (stringVals.length > 0) {
        parts.push(stringVals.join(', '));
      }
    }
  }

  return normalizeText(parts.join('\n'));
}

// ─── STOP WORDS ─────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
  'from', 'had', 'has', 'have', 'he', 'her', 'his', 'how', 'i',
  'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me', 'my', 'no',
  'nor', 'not', 'of', 'on', 'or', 'our', 'out', 'own', 'she', 'so',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
  'they', 'this', 'to', 'too', 'up', 'us', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'will', 'with', 'would', 'you', 'your',
]);
