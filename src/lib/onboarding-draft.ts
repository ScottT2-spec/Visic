export interface StoredOnboardingTemplate {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  previewImage: string;
  previewUrl: string;
  recommendationKeywords: string[];
  score?: number;
  matchPercent?: number;
  reasons?: string[];
}

export interface StoredOnboardingDraft {
  currentStep: number;
  siteType: string | null;
  industry: string | null;
  launchMethod: string | null;
  businessDetails: {
    name: string;
    description: string;
    logo: string;
    phone: string;
    email: string;
    location: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
    tiktok: string;
    products: string;
    services: string;
    targetAudience: string;
  };
  selectedTemplate: StoredOnboardingTemplate | null;
  selectedTemplateId: string | null;
  recommendations?: StoredOnboardingTemplate[];
}

const STORAGE_KEY_PREFIX = "afrostore:onboarding:draft";
const CHANGE_EVENT = "afrostore:onboarding:draft-changed";

const cachedDrafts = new Map<string, { raw: string; parsed: StoredOnboardingDraft | null }>();

export function getOnboardingDraftStorageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY_PREFIX}:${userId}` : STORAGE_KEY_PREFIX;
}

export function loadOnboardingDraft(userId?: string | null): StoredOnboardingDraft | null {
  if (typeof window === "undefined") return null;
  const storageKey = getOnboardingDraftStorageKey(userId);

  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  const cached = cachedDrafts.get(storageKey);
  if (cached && raw === cached.raw) return cached.parsed;

  try {
    const parsed = JSON.parse(raw) as StoredOnboardingDraft;
    cachedDrafts.set(storageKey, { raw, parsed });
    return parsed;
  } catch {
    cachedDrafts.delete(storageKey);
    return null;
  }
}

export function saveOnboardingDraft(draft: StoredOnboardingDraft, userId?: string | null) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(draft);
  const storageKey = getOnboardingDraftStorageKey(userId);
  localStorage.setItem(storageKey, serialized);
  sessionStorage.setItem(storageKey, serialized);
  cachedDrafts.set(storageKey, { raw: serialized, parsed: draft });
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearOnboardingDraft(userId?: string | null) {
  if (typeof window === "undefined") return;
  const storageKey = getOnboardingDraftStorageKey(userId);
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
  cachedDrafts.delete(storageKey);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onboardingDraftChangeEventName() {
  return CHANGE_EVENT;
}
