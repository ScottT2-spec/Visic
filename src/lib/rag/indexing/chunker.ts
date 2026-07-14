/**
 * AfroStore RAG Engine — Document Chunker
 *
 * Intelligent text chunking with:
 * - Recursive character splitting with priority separators
 * - Sentence boundary preservation
 * - Configurable overlap for context continuity
 * - Per-document-type chunking strategies
 * - Token-aware splitting (not just character count)
 */

import type { Chunk, ChunkingStrategy, DocumentType, RAGConfig } from '../types';
import { estimateTokens } from '../utils/tokenizer';
import { normalizeText } from '../utils/normalize';

export class DocumentChunker {
  private readonly defaultStrategy: ChunkingStrategy;
  private readonly typeStrategies: Partial<Record<DocumentType, ChunkingStrategy>>;

  constructor(config: RAGConfig['chunking']) {
    this.defaultStrategy = config.defaultStrategy;
    this.typeStrategies = config.typeStrategies || {};
  }

  /**
   * Split text into chunks respecting token limits and content boundaries.
   * Returns at least one chunk even for empty text.
   */
  chunk(text: string, documentType?: DocumentType): Chunk[] {
    const strategy = documentType
      ? this.typeStrategies[documentType] || this.defaultStrategy
      : this.defaultStrategy;

    const normalized = normalizeText(text);

    if (!normalized) {
      return [
        {
          content: '',
          index: 0,
          totalChunks: 1,
          startOffset: 0,
          endOffset: 0,
          tokenCount: 0,
        },
      ];
    }

    // If text fits in one chunk, return as-is
    const totalTokens = estimateTokens(normalized);
    if (totalTokens <= strategy.maxTokens) {
      return [
        {
          content: normalized,
          index: 0,
          totalChunks: 1,
          startOffset: 0,
          endOffset: normalized.length,
          tokenCount: totalTokens,
        },
      ];
    }

    const rawChunks = this.recursiveSplit(normalized, strategy);
    const withOverlap = strategy.overlapTokens > 0
      ? this.addOverlap(rawChunks, normalized, strategy)
      : rawChunks;

    // Finalize chunks with metadata
    const totalChunks = withOverlap.length;
    return withOverlap.map((content, index) => ({
      content,
      index,
      totalChunks,
      startOffset: normalized.indexOf(content.slice(0, 50)),
      endOffset: normalized.indexOf(content.slice(0, 50)) + content.length,
      tokenCount: estimateTokens(content),
    }));
  }

  /**
   * Recursively split text using separator hierarchy.
   * Tries the highest-priority separator first, falls back to lower ones.
   */
  private recursiveSplit(text: string, strategy: ChunkingStrategy): string[] {
    const { maxTokens, separators, preserveSentences } = strategy;

    if (estimateTokens(text) <= maxTokens) {
      return [text.trim()].filter(Boolean);
    }

    // Try each separator in priority order
    for (const separator of separators) {
      const segments = text.split(separator);
      if (segments.length <= 1) continue;

      const chunks: string[] = [];
      let currentChunk = '';

      for (const segment of segments) {
        const candidate = currentChunk
          ? currentChunk + separator + segment
          : segment;

        if (estimateTokens(candidate) <= maxTokens) {
          currentChunk = candidate;
        } else {
          // Current chunk is full
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }

          // If this single segment exceeds maxTokens, recursively split it
          if (estimateTokens(segment) > maxTokens) {
            const subChunks = this.recursiveSplit(segment, strategy);
            chunks.push(...subChunks);
            currentChunk = '';
          } else {
            currentChunk = segment;
          }
        }
      }

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      if (chunks.length > 0) {
        // Optionally enforce sentence boundaries
        if (preserveSentences) {
          return chunks.map((c) => this.trimToSentence(c));
        }
        return chunks;
      }
    }

    // Last resort: hard split by character count
    return this.hardSplit(text, maxTokens);
  }

  /** Add overlapping content between chunks for context continuity */
  private addOverlap(
    chunks: string[],
    originalText: string,
    strategy: ChunkingStrategy
  ): string[] {
    if (chunks.length <= 1) return chunks;

    const overlapChars = strategy.overlapTokens * 4; // ~4 chars per token
    const result: string[] = [chunks[0]];

    for (let i = 1; i < chunks.length; i++) {
      const prevChunk = chunks[i - 1];
      const overlapText = prevChunk.slice(-overlapChars);

      // Find a clean break point in the overlap
      const breakPoint = overlapText.indexOf('. ');
      const cleanOverlap = breakPoint > 0
        ? overlapText.slice(breakPoint + 2)
        : overlapText;

      const withOverlap = cleanOverlap + ' ' + chunks[i];

      // Don't add overlap if it would exceed max tokens
      if (estimateTokens(withOverlap) <= strategy.maxTokens) {
        result.push(withOverlap.trim());
      } else {
        result.push(chunks[i]);
      }
    }

    return result;
  }

  /** Trim text to the last complete sentence */
  private trimToSentence(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;

    // If already ends with sentence-ending punctuation, keep as-is
    if (/[.!?]$/.test(trimmed)) return trimmed;

    // Find the last sentence boundary
    const lastPeriod = trimmed.lastIndexOf('. ');
    const lastExclaim = trimmed.lastIndexOf('! ');
    const lastQuestion = trimmed.lastIndexOf('? ');
    const lastBoundary = Math.max(lastPeriod, lastExclaim, lastQuestion);

    // Only trim if we'd keep at least 70% of the content
    if (lastBoundary > trimmed.length * 0.7) {
      return trimmed.slice(0, lastBoundary + 1).trim();
    }

    return trimmed;
  }

  /** Hard split when no separator works */
  private hardSplit(text: string, maxTokens: number): string[] {
    const maxChars = maxTokens * 4;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += maxChars) {
      let end = Math.min(i + maxChars, text.length);

      // Try to break at a word boundary
      if (end < text.length) {
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > i + maxChars * 0.8) {
          end = lastSpace;
        }
      }

      const chunk = text.slice(i, end).trim();
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }
}
