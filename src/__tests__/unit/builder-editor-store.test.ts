import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  addBuilderEditorBlock,
  deleteBuilderEditorBlock,
  duplicateBuilderEditorBlock,
  getBuilderEditorSnapshot,
  getBuilderEditorStorageKey,
  initializeBuilderEditorSession,
  redoBuilderEditor,
  resetBuilderEditorSession,
  setBuilderEditorBlocks,
  setBuilderEditorPageSettings,
  setBuilderEditorPageTitle,
  setBuilderEditorPublished,
  undoBuilderEditor,
  updateBuilderEditorBlockProp,
} from "@/lib/builder/editor-store";

describe("builder editor store", () => {
  beforeEach(() => {
    resetBuilderEditorSession();
  });

  it("scopes drafts by user, site, and page", () => {
    assert.equal(
      getBuilderEditorStorageKey("user-a", "site-a", "page-a"),
      "afrostore:builder-editor:user-a:site-a:page-a",
    );
    assert.notEqual(
      getBuilderEditorStorageKey("user-a", "site-a", "page-a"),
      getBuilderEditorStorageKey("user-b", "site-a", "page-a"),
    );
    assert.notEqual(
      getBuilderEditorStorageKey("user-a", "site-a", "page-a"),
      getBuilderEditorStorageKey("user-a", "site-b", "page-a"),
    );
  });

  it("keeps state isolated between different sessions", () => {
    initializeBuilderEditorSession({
      storageKey: "afrostore:builder-editor:user-a:site-a:page-a",
      siteId: "site-a",
      siteSlug: "store-a",
      pageId: "page-a",
      pageSlug: "home",
      pageTitle: "First draft",
      isPublished: false,
      blocks: [
        { id: "block-a", type: "heading", props: { text: "Hello", level: "h2", align: "left", color: "#111111" } },
      ],
      pageSettings: { backgroundColor: "#ffffff" },
    });

    updateBuilderEditorBlockProp("block-a", "text", "Updated");
    setBuilderEditorPageTitle("Updated title");
    setBuilderEditorPublished(true);
    setBuilderEditorPageSettings({ backgroundColor: "#f5f5f5" });

    const first = getBuilderEditorSnapshot();
    assert.equal(first.pageTitle, "Updated title");
    assert.equal(first.isPublished, true);
    assert.equal(first.blocks[0].props.text, "Updated");
    assert.equal(first.pageSettings.backgroundColor, "#f5f5f5");

    initializeBuilderEditorSession({
      storageKey: "afrostore:builder-editor:user-b:site-a:page-a",
      siteId: "site-a",
      siteSlug: "store-a",
      pageId: "page-a",
      pageSlug: "home",
      pageTitle: "Second draft",
      isPublished: false,
      blocks: [
        { id: "block-b", type: "heading", props: { text: "Fresh", level: "h2", align: "left", color: "#111111" } },
      ],
      pageSettings: {},
    });

    const second = getBuilderEditorSnapshot();
    assert.equal(second.pageTitle, "Second draft");
    assert.equal(second.isPublished, false);
    assert.equal(second.blocks[0].props.text, "Fresh");
  });

  it("supports add, duplicate, delete, undo, and redo", () => {
    initializeBuilderEditorSession({
      storageKey: "afrostore:builder-editor:user-a:site-a:page-b",
      siteId: "site-a",
      siteSlug: "store-a",
      pageId: "page-b",
      pageSlug: "about",
      pageTitle: "About",
      isPublished: false,
      blocks: [
        { id: "block-a", type: "heading", props: { text: "Welcome", level: "h2", align: "left", color: "#111111" } },
      ],
      pageSettings: {},
    });

    const added = addBuilderEditorBlock("button");
    assert.ok(added);
    assert.equal(getBuilderEditorSnapshot().selectedBlockId, added.id);

    const duplicate = duplicateBuilderEditorBlock("block-a");
    assert.ok(duplicate);
    assert.equal(getBuilderEditorSnapshot().blocks.length, 3);
    assert.equal(getBuilderEditorSnapshot().blocks[1].id, duplicate?.id);

    deleteBuilderEditorBlock("block-a");
    assert.equal(getBuilderEditorSnapshot().blocks.length, 2);

    undoBuilderEditor();
    assert.equal(getBuilderEditorSnapshot().blocks.length, 3);

    redoBuilderEditor();
    assert.equal(getBuilderEditorSnapshot().blocks.length, 2);

    setBuilderEditorBlocks([
      { id: "block-z", type: "text", props: { text: "Reset", align: "left", color: "#111111" } },
    ]);
    assert.equal(getBuilderEditorSnapshot().blocks.length, 1);
  });
});
