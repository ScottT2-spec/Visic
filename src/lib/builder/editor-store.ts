"use client";

import { useSyncExternalStore } from "react";
import { BuilderHistory } from "@/lib/builder/history";
import { blockDefaults, type BuilderBlock, type BlockType } from "@/lib/builder/types";
import { type PageSettings } from "@/lib/page-content";

export interface BuilderEditorSessionInit {
  storageKey: string;
  siteId: string;
  siteSlug: string;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  isPublished: boolean;
  blocks: BuilderBlock[];
  pageSettings: PageSettings;
  selectedBlockId?: string | null;
}

export interface BuilderEditorSnapshot {
  storageKey: string | null;
  siteId: string | null;
  siteSlug: string;
  pageId: string | null;
  pageSlug: string;
  pageTitle: string;
  isPublished: boolean;
  blocks: BuilderBlock[];
  pageSettings: PageSettings;
  selectedBlockId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  hydrated: boolean;
  lastSavedAt: string | null;
}

type PersistedBuilderEditorSnapshot = Omit<BuilderEditorSnapshot, "canUndo" | "canRedo"> & {
  schemaVersion: number;
};

const STORAGE_SCHEMA_VERSION = 1;

const defaultSnapshot: BuilderEditorSnapshot = {
  storageKey: null,
  siteId: null,
  siteSlug: "",
  pageId: null,
  pageSlug: "",
  pageTitle: "",
  isPublished: false,
  blocks: [],
  pageSettings: {},
  selectedBlockId: null,
  canUndo: false,
  canRedo: false,
  hydrated: false,
  lastSavedAt: null,
};

let state: BuilderEditorSnapshot = { ...defaultSnapshot };
let history = new BuilderHistory();
let hydratedStorageKey: string | null = null;
const listeners = new Set<() => void>();

function clone<T>(value: T): T {
  if (value === null || value === undefined || typeof value !== "object") {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function hasMeaningfulBlocks(blocks: BuilderBlock[] | undefined | null) {
  return Array.isArray(blocks) && blocks.length > 0;
}

function emit() {
  for (const listener of listeners) listener();
}

function syncHistoryFlags() {
  state = {
    ...state,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  };
}

function persistState() {
  if (typeof window === "undefined" || !state.storageKey) return;

  const payload: PersistedBuilderEditorSnapshot = {
    ...state,
    schemaVersion: STORAGE_SCHEMA_VERSION,
  };

  try {
    localStorage.setItem(state.storageKey, JSON.stringify(payload));
  } catch {
    // Ignore storage failures; the editor still works in-memory.
  }
}

function loadPersistedState(storageKey: string): BuilderEditorSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedBuilderEditorSnapshot> | null;
    if (!parsed || parsed.schemaVersion !== STORAGE_SCHEMA_VERSION) return null;

    return {
      storageKey,
      siteId: typeof parsed.siteId === "string" ? parsed.siteId : null,
      siteSlug: typeof parsed.siteSlug === "string" ? parsed.siteSlug : "",
      pageId: typeof parsed.pageId === "string" ? parsed.pageId : null,
      pageSlug: typeof parsed.pageSlug === "string" ? parsed.pageSlug : "",
      pageTitle: typeof parsed.pageTitle === "string" ? parsed.pageTitle : "",
      isPublished: typeof parsed.isPublished === "boolean" ? parsed.isPublished : false,
      blocks: Array.isArray(parsed.blocks) ? (parsed.blocks as BuilderBlock[]) : [],
      pageSettings: parsed.pageSettings && typeof parsed.pageSettings === "object" ? (parsed.pageSettings as PageSettings) : {},
      selectedBlockId: typeof parsed.selectedBlockId === "string" ? parsed.selectedBlockId : null,
      canUndo: false,
      canRedo: false,
      hydrated: true,
      lastSavedAt: typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
    };
  } catch {
    return null;
  }
}

function applyState(next: BuilderEditorSnapshot, options?: { persist?: boolean }) {
  state = next;
  syncHistoryFlags();
  if (options?.persist !== false) persistState();
  emit();
}

function pushHistorySnapshot(blocks: BuilderBlock[]) {
  history.push(clone(blocks));
  syncHistoryFlags();
}

function ensureSession(storageKey: string) {
  if (hydratedStorageKey === storageKey) return;

  const restored = loadPersistedState(storageKey);
  if (restored && (hasMeaningfulBlocks(restored.blocks) || !hasMeaningfulBlocks(state.blocks))) {
    state = restored;
  }

  hydratedStorageKey = storageKey;
  syncHistoryFlags();
  emit();
}

export function initializeBuilderEditorSession(init: BuilderEditorSessionInit) {
  hydratedStorageKey = init.storageKey;
  history = new BuilderHistory();

  const baseBlocks = clone(init.blocks);
  const basePageSettings = clone(init.pageSettings);

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(init.storageKey);
    } catch {
      // Ignore storage failures.
    }
  }

  applyState(
    {
      ...defaultSnapshot,
      storageKey: init.storageKey,
      siteId: init.siteId,
      siteSlug: init.siteSlug,
      pageId: init.pageId,
      pageSlug: init.pageSlug,
      pageTitle: init.pageTitle,
      isPublished: init.isPublished,
      blocks: baseBlocks,
      pageSettings: basePageSettings,
      selectedBlockId: init.selectedBlockId ?? null,
      hydrated: true,
      lastSavedAt: null,
    },
    { persist: false },
  );
}

export function subscribeBuilderEditor(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBuilderEditorSnapshot() {
  return state;
}

export function useBuilderEditor() {
  return useSyncExternalStore(subscribeBuilderEditor, getBuilderEditorSnapshot, getBuilderEditorSnapshot);
}

export function setBuilderEditorPageTitle(pageTitle: string) {
  applyState({ ...state, pageTitle });
}

export function setBuilderEditorPublished(isPublished: boolean) {
  applyState({ ...state, isPublished });
}

export function setBuilderEditorSelectedBlockId(selectedBlockId: string | null) {
  applyState({ ...state, selectedBlockId });
}

export function setBuilderEditorPageSlug(pageSlug: string) {
  applyState({ ...state, pageSlug });
}

export function setBuilderEditorPageSettings(pageSettings: PageSettings) {
  applyState({ ...state, pageSettings: clone(pageSettings), selectedBlockId: state.selectedBlockId });
}

export function setBuilderEditorBlocks(blocks: BuilderBlock[]) {
  pushHistorySnapshot(state.blocks);
  applyState({ ...state, blocks: clone(blocks) });
}

export function replaceBuilderEditorBlock(updatedBlock: BuilderBlock) {
  pushHistorySnapshot(state.blocks);
  const nextBlocks = state.blocks.map((block) => (block.id === updatedBlock.id ? clone(updatedBlock) : block));
  applyState({ ...state, blocks: nextBlocks });
}

export function updateBuilderEditorBlockProps(blockId: string, props: Record<string, unknown>) {
  const currentBlock = state.blocks.find((block) => block.id === blockId);
  if (!currentBlock) return;
  replaceBuilderEditorBlock({ ...currentBlock, props: { ...currentBlock.props, ...clone(props) } });
}

export function updateBuilderEditorBlockProp(blockId: string, key: string, value: unknown) {
  const currentBlock = state.blocks.find((block) => block.id === blockId);
  if (!currentBlock) return;
  replaceBuilderEditorBlock({ ...currentBlock, props: { ...currentBlock.props, [key]: clone(value) } });
}

export function addBuilderEditorBlock(type: BlockType, index?: number) {
  const newBlock: BuilderBlock = { id: crypto.randomUUID(), type, props: blockDefaults[type]() };
  pushHistorySnapshot(state.blocks);
  const nextBlocks = [...state.blocks];
  if (typeof index === "number") {
    nextBlocks.splice(index, 0, newBlock);
  } else {
    nextBlocks.push(newBlock);
  }
  applyState({ ...state, blocks: nextBlocks, selectedBlockId: newBlock.id });
  return newBlock;
}

export function duplicateBuilderEditorBlock(blockId: string) {
  const index = state.blocks.findIndex((block) => block.id === blockId);
  if (index === -1) return null;
  const source = state.blocks[index];
  const duplicate: BuilderBlock = {
    id: crypto.randomUUID(),
    type: source.type,
    props: clone(source.props),
  };

  pushHistorySnapshot(state.blocks);
  const nextBlocks = [...state.blocks];
  nextBlocks.splice(index + 1, 0, duplicate);
  applyState({ ...state, blocks: nextBlocks, selectedBlockId: duplicate.id });
  return duplicate;
}

export function deleteBuilderEditorBlock(blockId: string) {
  if (!state.blocks.some((block) => block.id === blockId)) return;
  pushHistorySnapshot(state.blocks);
  applyState({
    ...state,
    blocks: state.blocks.filter((block) => block.id !== blockId),
    selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
  });
}

export function moveBuilderEditorBlock(blockId: string, direction: "up" | "down") {
  const index = state.blocks.findIndex((block) => block.id === blockId);
  if (index === -1) return;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= state.blocks.length) return;

  pushHistorySnapshot(state.blocks);
  const nextBlocks = [...state.blocks];
  const [moved] = nextBlocks.splice(index, 1);
  nextBlocks.splice(targetIndex, 0, moved);
  applyState({ ...state, blocks: nextBlocks });
}

export function undoBuilderEditor() {
  const previous = history.undo(state.blocks);
  if (!previous) return;
  applyState({ ...state, blocks: previous }, { persist: false });
  persistState();
}

export function redoBuilderEditor() {
  const next = history.redo(state.blocks);
  if (!next) return;
  applyState({ ...state, blocks: next }, { persist: false });
  persistState();
}

export function markBuilderEditorSaved() {
  applyState({ ...state, lastSavedAt: new Date().toISOString() });
}

export function resetBuilderEditorSession() {
  state = { ...defaultSnapshot };
  history = new BuilderHistory();
  hydratedStorageKey = null;
  emit();
}

export function getBuilderEditorStorageKey(userId: string | null | undefined, siteId: string, pageId: string) {
  return `afrostore:builder-editor:${userId || "guest"}:${siteId}:${pageId}`;
}

export function loadBuilderEditorDraft(storageKey: string) {
  ensureSession(storageKey);
  return getBuilderEditorSnapshot();
}
