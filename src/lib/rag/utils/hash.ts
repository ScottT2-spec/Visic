/**
 * AfroStore RAG Engine — Content Hashing
 *
 * Fast, deterministic hashing for content deduplication and change detection.
 * Uses Web Crypto API (available in Node 18+ and all modern runtimes).
 */

import { createHash } from 'crypto';

/** Synchronous SHA-256 hash of content → hex string */
export function createContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Fast non-cryptographic hash for cache keys (FNV-1a) */
export function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(36);
}
