/**
 * AfroStore RAG Engine — Embedding Provider Interface & Factory
 */

import type { EmbeddingProvider, RAGConfig } from '../types';
import { ConfigError } from '../errors';
import { OpenAIEmbeddingProvider } from './openai';

export function createEmbeddingProvider(config: RAGConfig['embedding']): EmbeddingProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIEmbeddingProvider(config);
    case 'cohere':
      throw new ConfigError('Cohere embedding provider not yet implemented');
    case 'local':
      throw new ConfigError('Local embedding provider not yet implemented');
    default:
      throw new ConfigError(`Unknown embedding provider: ${config.provider}`);
  }
}
