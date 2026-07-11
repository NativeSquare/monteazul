export const COVER_ZOOM_MIN: number;
export const COVER_ZOOM_MAX: number;

/** The owner-chosen framing of the card cover (all axes optional). */
export type CoverFrame = {
  /** Horizontal focal point, 0–100 (% from the left). Absent = 50. */
  coverFocusX?: number | undefined;
  /** Vertical focal point, 0–100 (% from the top). Absent = 50. */
  coverFocusY?: number | undefined;
  /** Zoom in percent, 100–250. Absent = 100 (no zoom). */
  coverZoom?: number | undefined;
};

export function coverCropStyle(frame: CoverFrame): {
  objectPosition: string;
  transform?: string;
  transformOrigin?: string;
};
