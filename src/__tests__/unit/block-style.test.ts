import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getSectionStyle, resolveOpacity } from "@/components/storefront/block-style";

describe("block style helpers", () => {
  it("normalizes opacity values for overlays", () => {
    assert.equal(resolveOpacity(35, 0.35), 0.35);
    assert.equal(resolveOpacity(0.4, 0.35), 0.4);
    assert.equal(resolveOpacity(undefined, 0.35), 0.35);
  });

  it("maps background image and color bindings onto section styles", () => {
    const style = getSectionStyle({
      bgImage: "/uploads/hero.jpg",
      bgColor: "#112233",
      textColor: "#ffffff",
    });

    assert.equal(style.backgroundImage, "url(/uploads/hero.jpg)");
    assert.equal(style.backgroundSize, "cover");
    assert.equal(style.backgroundPosition, "center center");
    assert.equal(style.backgroundRepeat, "no-repeat");
    assert.equal(style.backgroundColor, "#112233");
    assert.equal(style.color, "#ffffff");
  });
});
