/**
 * AfroStore RAG Engine — LLM Context Builder
 *
 * Transforms search results into optimized context for LLM consumption.
 * Handles:
 * - Token budget management (never exceed context window)
 * - Document grouping by type for coherent context
 * - Source attribution for transparency
 * - Priority-based inclusion (most relevant first)
 * - Smart truncation that preserves complete documents
 *
 * Output format is optimized for LLM comprehension:
 * - Clear section headers
 * - Structured metadata inline
 * - Source references for grounding
 */

import type {
  SearchResponse,
  SearchResult,
  ContextBuilderOptions,
  RetrievalContext,
  ContextSource,
  DocumentType,
} from '../types';
import { estimateTokens, truncateToTokens } from '../utils/tokenizer';
import { createLogger } from '../logger';

const logger = createLogger('retrieval.context');

/** Human-readable labels for document types */
const TYPE_LABELS: Record<string, string> = {
  product: '📦 Products',
  order: '📋 Orders',
  customer: '👥 Customers',
  page: '📄 Pages',
  plugin: '🔌 Plugins',
  category: '📂 Categories',
  coupon: '🏷️ Coupons',
  review: '⭐ Reviews',
  delivery_zone: '🚚 Delivery Zones',
  store_settings: '⚙️ Store Settings',
  analytics_summary: '📊 Analytics',
};

export class ContextBuilder {
  private readonly options: ContextBuilderOptions;

  constructor(options: ContextBuilderOptions) {
    this.options = options;
  }

  /**
   * Build an LLM-ready context string from search results.
   * Respects token budget and provides source attribution.
   */
  build(searchResponse: SearchResponse, query?: string): RetrievalContext {
    const { results } = searchResponse;
    const sources: ContextSource[] = [];
    let truncated = false;

    if (results.length === 0) {
      return {
        context: this.options.preamble || 'No relevant information found in the store data.',
        estimatedTokens: estimateTokens(this.options.preamble || ''),
        sources: [],
        truncated: false,
        searchResponse,
      };
    }

    const parts: string[] = [];
    let tokenBudget = this.options.maxContextTokens;

    // Add preamble if configured
    if (this.options.preamble) {
      parts.push(this.options.preamble);
      tokenBudget -= estimateTokens(this.options.preamble);
    }

    // Add query context
    if (query) {
      const queryLine = `Query: "${query}"\n`;
      parts.push(queryLine);
      tokenBudget -= estimateTokens(queryLine);
    }

    // Reserve tokens for closing
    const closingReserve = 50;
    tokenBudget -= closingReserve;

    if (this.options.groupByType) {
      // Group results by document type
      const grouped = this.groupByType(results);
      const typePriority = this.options.typePriority || Object.keys(grouped) as DocumentType[];

      for (const type of typePriority) {
        const typeResults = grouped[type];
        if (!typeResults || typeResults.length === 0) continue;

        const label = TYPE_LABELS[type] || type;
        const header = `\n--- ${label} ---\n`;
        const headerTokens = estimateTokens(header);

        if (tokenBudget - headerTokens < 100) {
          truncated = true;
          break;
        }

        parts.push(header);
        tokenBudget -= headerTokens;

        for (const result of typeResults) {
          const formatted = this.formatResult(result);
          const resultTokens = estimateTokens(formatted);

          if (resultTokens > tokenBudget) {
            // Try to fit a truncated version
            if (tokenBudget > 100) {
              const truncatedContent = truncateToTokens(formatted, tokenBudget);
              parts.push(truncatedContent);
              tokenBudget -= estimateTokens(truncatedContent);
              sources.push(this.toSource(result));
              truncated = true;
            }
            break;
          }

          parts.push(formatted);
          tokenBudget -= resultTokens;
          sources.push(this.toSource(result));
        }
      }
    } else {
      // Flat list, ordered by relevance
      for (const result of results) {
        const formatted = this.formatResult(result);
        const resultTokens = estimateTokens(formatted);

        if (resultTokens > tokenBudget) {
          if (tokenBudget > 100) {
            const truncatedContent = truncateToTokens(formatted, tokenBudget);
            parts.push(truncatedContent);
            tokenBudget -= estimateTokens(truncatedContent);
            sources.push(this.toSource(result));
            truncated = true;
          }
          break;
        }

        parts.push(formatted);
        tokenBudget -= resultTokens;
        sources.push(this.toSource(result));
      }
    }

    // Add source references
    if (this.options.includeSources && sources.length > 0) {
      const sourceSection = this.formatSources(sources);
      const sourceTokens = estimateTokens(sourceSection);
      if (sourceTokens <= tokenBudget + closingReserve) {
        parts.push(sourceSection);
      }
    }

    const context = parts.join('\n');
    const estimatedTokenCount = estimateTokens(context);

    logger.debug('Context built', {
      results: results.length,
      sourcesIncluded: sources.length,
      estimatedTokens: estimatedTokenCount,
      truncated,
    });

    return {
      context,
      estimatedTokens: estimatedTokenCount,
      sources,
      truncated,
      searchResponse,
    };
  }

  // ─── FORMATTING ───────────────────────────────────────

  private formatResult(result: SearchResult): string {
    const parts: string[] = [];
    const meta = result.metadata;

    // Title line
    parts.push(`• ${meta.title || 'Untitled'}`);

    // Include key metadata inline
    if (this.options.includeMetadata) {
      const metaParts = this.extractKeyMetadata(result);
      if (metaParts.length > 0) {
        parts.push(`  [${metaParts.join(' | ')}]`);
      }
    }

    // Content
    if (result.content) {
      // Indent content for readability
      const contentLines = result.content
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');
      parts.push(contentLines);
    }

    return parts.join('\n') + '\n';
  }

  /** Extract the most important metadata fields per document type */
  private extractKeyMetadata(result: SearchResult): string[] {
    const meta = result.metadata as Record<string, unknown>;
    const parts: string[] = [];

    switch (result.documentType) {
      case 'product':
        if (meta.price) parts.push(`${meta.currency || 'GHS'} ${meta.price}`);
        if (meta.stock !== undefined) parts.push(`Stock: ${meta.stock}`);
        if (meta.category) parts.push(`Cat: ${meta.category}`);
        if (meta.status) parts.push(`Status: ${meta.status}`);
        break;

      case 'order':
        if (meta.orderNumber) parts.push(`#${meta.orderNumber}`);
        if (meta.total) parts.push(`${meta.currency || 'GHS'} ${meta.total}`);
        if (meta.status) parts.push(`Status: ${meta.status}`);
        if (meta.paymentStatus) parts.push(`Payment: ${meta.paymentStatus}`);
        break;

      case 'customer':
        if (meta.email) parts.push(String(meta.email));
        if (meta.totalOrders) parts.push(`Orders: ${meta.totalOrders}`);
        if (meta.totalSpent) parts.push(`Spent: ${meta.currency || 'GHS'} ${meta.totalSpent}`);
        break;

      case 'review':
        if (meta.rating) parts.push(`Rating: ${meta.rating}/5`);
        if (meta.isVerified) parts.push('Verified');
        break;

      case 'plugin':
        if (meta.category) parts.push(`Cat: ${meta.category}`);
        if (meta.rating) parts.push(`Rating: ${meta.rating}/5`);
        if (meta.isPremium) parts.push('Premium');
        break;

      default:
        // Generic: include type
        parts.push(`Type: ${result.documentType}`);
    }

    // Add relevance score for transparency
    parts.push(`Relevance: ${(result.score * 100).toFixed(0)}%`);

    return parts;
  }

  private formatSources(sources: ContextSource[]): string {
    const lines = ['\n--- Sources ---'];
    for (const source of sources) {
      lines.push(
        `[${source.documentType}:${source.documentId}] ${source.title} (score: ${(source.relevanceScore * 100).toFixed(0)}%)`
      );
    }
    return lines.join('\n');
  }

  private toSource(result: SearchResult): ContextSource {
    return {
      documentId: result.documentId,
      documentType: result.documentType as DocumentType,
      title: result.metadata?.title || 'Untitled',
      relevanceScore: result.score,
      chunkRange: [result.chunkIndex, result.chunkIndex],
    };
  }

  private groupByType(
    results: SearchResult[]
  ): Partial<Record<string, SearchResult[]>> {
    const grouped: Partial<Record<string, SearchResult[]>> = {};
    for (const result of results) {
      const type = result.documentType;
      if (!grouped[type]) grouped[type] = [];
      grouped[type]!.push(result);
    }
    return grouped;
  }
}
