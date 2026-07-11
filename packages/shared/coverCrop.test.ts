import { describe, expect, it } from "vitest";

import {
  COVER_ZOOM_MAX,
  COVER_ZOOM_MIN,
  coverCropStyle,
} from "./coverCrop";

describe("coverCropStyle", () => {
  it("defaults to a centred, unzoomed crop (the pre-framing rendering)", () => {
    expect(coverCropStyle({})).toEqual({ objectPosition: "50% 50%" });
  });

  it("maps the focal point to object-position without any transform at 100%", () => {
    expect(coverCropStyle({ coverFocusX: 20, coverFocusY: 80 })).toEqual({
      objectPosition: "20% 80%",
    });
  });

  it("zooms by scaling around the focal point", () => {
    expect(
      coverCropStyle({ coverFocusX: 25, coverFocusY: 75, coverZoom: 150 }),
    ).toEqual({
      objectPosition: "25% 75%",
      transform: "scale(1.5)",
      transformOrigin: "25% 75%",
    });
  });

  it("keeps the zoom bounds shared with the backend clamp", () => {
    expect(COVER_ZOOM_MIN).toBe(100);
    expect(COVER_ZOOM_MAX).toBe(250);
  });
});
