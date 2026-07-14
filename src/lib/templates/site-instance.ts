// Stub — templates removed. These functions pass pages through unchanged.

export function mergeStoredTemplatePages<T>(pages: T[], _templatePages?: unknown): T[] {
  return pages;
}

export function findStoredTemplatePage(_templatePages: unknown, _slug: string): null {
  return null;
}

export function normalizeStoredTemplatePages(pages: unknown): unknown[] {
  return Array.isArray(pages) ? pages : [];
}
