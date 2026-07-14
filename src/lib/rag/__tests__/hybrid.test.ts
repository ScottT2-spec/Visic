/**
 * Tests for Hybrid Search (RRF fusion logic)
 *
 * These test the RRF algorithm itself, not database queries.
 * Integration tests with actual PostgreSQL are in __tests__/integration/.
 */

import type { SearchResult } from '../types';
import { DocumentType } from '../types';

// Standalone RRF implementation for unit testing
function reciprocalRankFusion(
  bm25Results: SearchResult[],
  vectorResults: SearchResult[],
  k = 60,
  bm25Weight = 1.0,
  vectorWeight = 1.0
): SearchResult[] {
  const bm25Ranks = new Map<string, { rank: number; result: SearchResult }>();
  const vectorRanks = new Map<string, { rank: number; result: SearchResult }>();

  for (let i = 0; i < bm25Results.length; i++) {
    const key = `${bm25Results[i].documentId}:${bm25Results[i].chunkIndex}`;
    bm25Ranks.set(key, { rank: i + 1, result: bm25Results[i] });
  }
  for (let i = 0; i < vectorResults.length; i++) {
    const key = `${vectorResults[i].documentId}:${vectorResults[i].chunkIndex}`;
    vectorRanks.set(key, { rank: i + 1, result: vectorResults[i] });
  }

  const allKeys = new Set([...bm25Ranks.keys(), ...vectorRanks.keys()]);
  const bm25Penalty = bm25Results.length + 1;
  const vectorPenalty = vectorResults.length + 1;

  const scored: Array<{ result: SearchResult; rrfScore: number }> = [];

  for (const key of allKeys) {
    const bm25Rank = bm25Ranks.get(key)?.rank ?? bm25Penalty;
    const vectorRank = vectorRanks.get(key)?.rank ?? vectorPenalty;
    const rrfScore = bm25Weight / (k + bm25Rank) + vectorWeight / (k + vectorRank);
    const result = bm25Ranks.get(key)?.result ?? vectorRanks.get(key)!.result;
    scored.push({ result: { ...result, score: rrfScore }, rrfScore });
  }

  scored.sort((a, b) => b.rrfScore - a.rrfScore);
  return scored.map((s) => s.result);
}

function makeResult(docId: string, score: number): SearchResult {
  return {
    id: `chunk_${docId}`,
    documentId: docId,
    documentType: DocumentType.PRODUCT,
    siteId: 'store_1',
    score,
    content: `Content for ${docId}`,
    metadata: { title: docId, sourceType: DocumentType.PRODUCT, sourceId: docId, siteId: 'store_1' },
    chunkIndex: 0,
    chunkTotal: 1,
  };
}

describe('Reciprocal Rank Fusion', () => {
  it('ranks documents appearing in both lists highest', () => {
    const bm25 = [makeResult('A', 0.9), makeResult('B', 0.7), makeResult('C', 0.5)];
    const vector = [makeResult('B', 0.95), makeResult('A', 0.8), makeResult('D', 0.7)];

    const fused = reciprocalRankFusion(bm25, vector);

    // A and B appear in both, should rank highest
    const topIds = fused.slice(0, 2).map((r) => r.documentId);
    expect(topIds).toContain('A');
    expect(topIds).toContain('B');
  });

  it('includes documents from only one list with penalty', () => {
    const bm25 = [makeResult('A', 0.9)];
    const vector = [makeResult('B', 0.9)];

    const fused = reciprocalRankFusion(bm25, vector);

    expect(fused).toHaveLength(2);
    expect(fused.map((r) => r.documentId)).toContain('A');
    expect(fused.map((r) => r.documentId)).toContain('B');
  });

  it('respects weight parameters', () => {
    const bm25 = [makeResult('A', 0.9), makeResult('B', 0.5)];
    const vector = [makeResult('B', 0.9), makeResult('A', 0.5)];

    // Heavy BM25 weight should favor A (BM25 rank 1) over B (BM25 rank 2)
    const bm25Heavy = reciprocalRankFusion(bm25, vector, 60, 3.0, 1.0);
    expect(bm25Heavy[0].documentId).toBe('A');

    // Heavy vector weight should favor B (vector rank 1) over A (vector rank 2)
    const vecHeavy = reciprocalRankFusion(bm25, vector, 60, 1.0, 3.0);
    expect(vecHeavy[0].documentId).toBe('B');
  });

  it('handles empty result lists', () => {
    const bm25 = [makeResult('A', 0.9)];
    const empty: SearchResult[] = [];

    const fused = reciprocalRankFusion(bm25, empty);
    expect(fused).toHaveLength(1);
    expect(fused[0].documentId).toBe('A');
  });

  it('handles both lists empty', () => {
    const fused = reciprocalRankFusion([], []);
    expect(fused).toHaveLength(0);
  });

  it('k parameter affects score distribution', () => {
    const bm25 = [makeResult('A', 0.9), makeResult('B', 0.5)];
    const vector = [makeResult('A', 0.9), makeResult('B', 0.5)];

    // Small k → bigger spread between rank 1 and rank 2
    const smallK = reciprocalRankFusion(bm25, vector, 1);
    const largeK = reciprocalRankFusion(bm25, vector, 1000);

    const smallSpread = smallK[0].score - smallK[1].score;
    const largeSpread = largeK[0].score - largeK[1].score;

    expect(smallSpread).toBeGreaterThan(largeSpread);
  });
});
