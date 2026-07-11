/**
 * Cover framing of a Commerce card (« Encuadre de la portada »): the owner (or
 * the admin) picks which part of the FIRST photo shows in the listing-card
 * crop, on three axes — vertical, horizontal and zoom. This module is the
 * single source of the CSS that renders a frame, shared by the public card
 * (apps/web) and the live preview of the framing control (apps/admin).
 */

/** No-zoom floor, in percent — also the backend clamp floor. */
export const COVER_ZOOM_MIN = 100;
/** Zoom ceiling, in percent — also the backend clamp ceiling. */
export const COVER_ZOOM_MAX = 250;

/** @typedef {import("./coverCrop").CoverFrame} CoverFrame */

/**
 * CSS for an `object-cover` image cropped to the given frame. The focal point
 * drives `object-position`; zooming scales the element around that same point
 * (the container must be `overflow: hidden`). Absent values mean centred, no
 * zoom — the exact pre-framing rendering.
 *
 * @param {CoverFrame} frame
 * @returns {{ objectPosition: string, transform?: string, transformOrigin?: string }}
 */
export function coverCropStyle(frame) {
  const x = frame.coverFocusX ?? 50;
  const y = frame.coverFocusY ?? 50;
  const zoom = frame.coverZoom ?? COVER_ZOOM_MIN;
  /** @type {{ objectPosition: string, transform?: string, transformOrigin?: string }} */
  const style = { objectPosition: `${x}% ${y}%` };
  if (zoom > COVER_ZOOM_MIN) {
    style.transform = `scale(${zoom / 100})`;
    style.transformOrigin = `${x}% ${y}%`;
  }
  return style;
}
