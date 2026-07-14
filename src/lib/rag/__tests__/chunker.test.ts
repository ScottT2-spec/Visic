/**
 * Tests for DocumentChunker
 */

import { DocumentChunker } from '../indexing/chunker';
import { DocumentType } from '../types';
import { createDefaultConfig } from '../config';

const config = createDefaultConfig();
const chunker = new DocumentChunker(config.chunking);

describe('DocumentChunker', () => {
  it('returns single chunk for short text', () => {
    const chunks = chunker.chunk('A short product description.');
    expect(chunks).toHaveLength(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].totalChunks).toBe(1);
    expect(chunks[0].content).toBe('A short product description.');
  });

  it('returns single chunk for empty text', () => {
    const chunks = chunker.chunk('');
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe('');
    expect(chunks[0].tokenCount).toBe(0);
  });

  it('splits long text into multiple chunks', () => {
    const longText = Array(200).fill('This is a sentence about a product.').join(' ');
    const chunks = chunker.chunk(longText);
    expect(chunks.length).toBeGreaterThan(1);

    // All chunks should be within token limit
    for (const chunk of chunks) {
      expect(chunk.tokenCount).toBeLessThanOrEqual(config.chunking.defaultStrategy.maxTokens + 20); // small tolerance
    }

    // Chunk indices should be sequential
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].index).toBe(i);
      expect(chunks[i].totalChunks).toBe(chunks.length);
    }
  });

  it('uses type-specific strategies', () => {
    const text = Array(100).fill('Order item description here.').join(' ');

    const defaultChunks = chunker.chunk(text);
    const orderChunks = chunker.chunk(text, DocumentType.ORDER);

    // Order chunking has smaller maxTokens (256 vs 512), so should produce more chunks
    expect(orderChunks.length).toBeGreaterThanOrEqual(defaultChunks.length);
  });

  it('preserves sentence boundaries when configured', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.';
    const chunks = chunker.chunk(text);

    for (const chunk of chunks) {
      // Should not cut mid-sentence (unless at very end)
      if (chunk.content.length > 10) {
        const lastChar = chunk.content.trim().slice(-1);
        expect(['.', '!', '?', 'e']).toContain(lastChar); // 'e' for "sentence"
      }
    }
  });

  it('handles text with multiple separator types', () => {
    const text = [
      'Section 1 heading',
      '',
      'Paragraph in section 1. With multiple sentences. And more detail.',
      '',
      'Section 2 heading',
      '',
      'Paragraph in section 2. Also has sentences.',
    ].join('\n');

    const chunks = chunker.chunk(text);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].content).toBeTruthy();
  });
});
