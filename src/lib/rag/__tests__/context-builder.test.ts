/**
 * Tests for Context Builder
 */

import { ContextBuilder } from '../retrieval/context-builder';
import type { SearchResponse, SearchResult } from '../types';
import { DocumentType, SearchStrategy } from '../types';

function makeSearchResponse(results: SearchResult[]): SearchResponse {
  return {
    results,
    totalCount: results.length,
    meta: {
      strategy: SearchStrategy.HYBRID,
      query: 'test query',
      latencyMs: 50,
      timings: { totalMs: 50 },
      counts: { returned: results.length },
    },
  };
}

function makeResult(
  docType: DocumentType,
  title: string,
  content: string,
  score: number
): SearchResult {
  return {
    id: `id_${title}`,
    documentId: `doc_${title}`,
    documentType: docType,
    siteId: 'store_1',
    score,
    content,
    metadata: {
      title,
      sourceType: docType,
      sourceId: `doc_${title}`,
      siteId: 'store_1',
    },
    chunkIndex: 0,
    chunkTotal: 1,
  };
}

describe('ContextBuilder', () => {
  const builder = new ContextBuilder({
    maxContextTokens: 2048,
    includeMetadata: true,
    groupByType: true,
    includeSources: true,
    typePriority: [
      DocumentType.PRODUCT,
      DocumentType.ORDER,
      DocumentType.CUSTOMER,
    ],
  });

  it('builds context from search results', () => {
    const response = makeSearchResponse([
      makeResult(DocumentType.PRODUCT, 'Red Bag', 'A beautiful red leather bag', 0.9),
      makeResult(DocumentType.PRODUCT, 'Blue Bag', 'A stylish blue bag', 0.7),
    ]);

    const ctx = builder.build(response, 'leather bags');

    expect(ctx.context).toContain('Red Bag');
    expect(ctx.context).toContain('Blue Bag');
    expect(ctx.context).toContain('leather bags');
    expect(ctx.estimatedTokens).toBeGreaterThan(0);
    expect(ctx.sources).toHaveLength(2);
    expect(ctx.truncated).toBe(false);
  });

  it('returns empty context message when no results', () => {
    const response = makeSearchResponse([]);
    const ctx = builder.build(response);

    expect(ctx.context).toContain('No relevant information found');
    expect(ctx.sources).toHaveLength(0);
  });

  it('groups results by document type', () => {
    const response = makeSearchResponse([
      makeResult(DocumentType.PRODUCT, 'Product A', 'Content A', 0.9),
      makeResult(DocumentType.ORDER, 'Order 1', 'Content B', 0.8),
      makeResult(DocumentType.PRODUCT, 'Product B', 'Content C', 0.7),
    ]);

    const ctx = builder.build(response);

    // Products should appear before orders (typePriority)
    const productIdx = ctx.context.indexOf('Products');
    const orderIdx = ctx.context.indexOf('Orders');
    expect(productIdx).toBeLessThan(orderIdx);
  });

  it('respects token budget and truncates', () => {
    const tinyBuilder = new ContextBuilder({
      maxContextTokens: 100,
      includeMetadata: false,
      groupByType: false,
      includeSources: false,
    });

    const longContent = 'A'.repeat(2000);
    const response = makeSearchResponse([
      makeResult(DocumentType.PRODUCT, 'Big Product', longContent, 0.9),
      makeResult(DocumentType.PRODUCT, 'Another', 'Short', 0.5),
    ]);

    const ctx = tinyBuilder.build(response);
    expect(ctx.estimatedTokens).toBeLessThanOrEqual(150); // some overhead tolerance
    expect(ctx.truncated).toBe(true);
  });

  it('includes source references', () => {
    const response = makeSearchResponse([
      makeResult(DocumentType.PRODUCT, 'Test Product', 'Content here', 0.85),
    ]);

    const ctx = builder.build(response);
    expect(ctx.context).toContain('Sources');
    expect(ctx.context).toContain('85%');
  });
});
