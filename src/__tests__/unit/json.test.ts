import { test } from "node:test";
import assert from "node:assert/strict";
import { asRecord } from "../../lib/json.js";

test("asRecord returns an empty object for nullish and non-objects", () => {
  assert.deepEqual(asRecord(null), {});
  assert.deepEqual(asRecord(undefined), {});
  assert.deepEqual(asRecord("test"), {});
  assert.deepEqual(asRecord([1, 2, 3]), {});
});

test("asRecord preserves plain objects", () => {
  const input = { layout: "storefront", enabled: true };
  assert.deepEqual(asRecord(input), input);
});
