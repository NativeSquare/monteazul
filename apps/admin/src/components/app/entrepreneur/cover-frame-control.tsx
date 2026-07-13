"use client";

import * as React from "react";
import {
  COVER_ZOOM_MAX,
  COVER_ZOOM_MIN,
  coverCropStyle,
} from "@packages/shared/cover-crop";

export type CoverFrameValues = {
  coverFocusY: number;
  coverFocusX: number;
  coverZoom: number;
};

/**
 * « Encuadre de la portada »: pick which part of the cover photo shows in the
 * listing-card crop, on three axes — vertical, horizontal and zoom. Live
 * preview at the card's aspect via the SAME shared style as the public card;
 * each slider commits its own axis when the drag ends (not on every tick).
 *
 * Used by BOTH photo flows: « Mi negocio » / admin edit (server URL, commits
 * to the `setCoverFocus` mutation) and the creation wizard (local object-URL
 * preview, commits to local state until `submitCommerce`). The preview is a
 * plain <img> because object URLs cannot go through next/image.
 */
export function CoverFrameControl({
  photoUrl,
  initial,
  onCommit,
}: {
  photoUrl: string;
  initial: CoverFrameValues;
  onCommit: (patch: Partial<CoverFrameValues>) => void;
}) {
  const [frame, setFrame] = React.useState(initial);

  function slider(
    key: keyof CoverFrameValues,
    ariaLabel: string,
    min: number,
    max: number,
    labels: [string, string],
  ) {
    return (
      <div className="flex w-full max-w-[204px] items-center gap-2 sm:max-w-[248px]">
        <span className="text-muted-foreground w-14 shrink-0 text-right text-[11px]">
          {labels[0]}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={frame[key]}
          aria-label={ariaLabel}
          onChange={(event) =>
            setFrame((prev) => ({
              ...prev,
              [key]: Number(event.target.value),
            }))
          }
          onPointerUp={() => onCommit({ [key]: frame[key] })}
          onKeyUp={() => onCommit({ [key]: frame[key] })}
          onBlur={() => onCommit({ [key]: frame[key] })}
          className="accent-primary h-1.5 w-full cursor-pointer"
        />
        <span className="text-muted-foreground w-14 shrink-0 text-[11px]">
          {labels[1]}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">Encuadre de la portada</p>
        <p className="text-muted-foreground text-xs">
          Desliza para elegir qué parte de la primera foto se ve en la tarjeta
          del directorio: posición vertical, horizontal y tamaño.
        </p>
      </div>
      <div className="relative h-[132px] w-full max-w-[204px] overflow-hidden rounded-lg border sm:max-w-[248px]">
        {/* Plain <img>: the wizard previews a local object URL, which
            next/image cannot optimise. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="Vista previa de la portada"
          className="absolute inset-0 size-full object-cover"
          style={coverCropStyle(frame)}
        />
      </div>
      {slider("coverFocusY", "Encuadre vertical de la portada", 0, 100, [
        "Arriba",
        "Abajo",
      ])}
      {slider("coverFocusX", "Encuadre horizontal de la portada", 0, 100, [
        "Izquierda",
        "Derecha",
      ])}
      {slider(
        "coverZoom",
        "Zoom de la portada",
        COVER_ZOOM_MIN,
        COVER_ZOOM_MAX,
        ["Alejar", "Acercar"],
      )}
    </div>
  );
}
