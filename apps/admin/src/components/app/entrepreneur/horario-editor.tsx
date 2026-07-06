"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldError } from "@/components/ui/field";

/**
 * Structured Horario editor for the fiche form. Mirrors the domain model
 * (`packages/backend/CONTEXT.md` / `lib/horario`): either weekly ranges
 * (« plages » — days + opening/closing time) or a special « Disponible » mode
 * (con cita previa / sobre pedido). Times are held as minutes-of-day so they
 * match the backend `horario` validator exactly.
 */

export type HorarioPlages = {
  mode: "plages";
  days: string;
  from: number;
  to: number;
};
export type HorarioDisponible = { mode: "disponible"; label: string };
export type Horario = HorarioPlages | HorarioDisponible;

/** Minutes-of-day → `HH:MM` for a native time input. */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** `HH:MM` → minutes-of-day (0 on an empty/malformed value). */
function timeToMinutes(value: string): number {
  const [h, m] = value.split(":");
  const hours = Number(h);
  const mins = Number(m);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return 0;
  return hours * 60 + mins;
}

/**
 * Validate a Horario for submission. Returns a Spanish error message or `null`.
 */
export function validateHorario(horario: Horario): string | null {
  if (horario.mode === "plages") {
    if (horario.days.trim().length === 0) {
      return "Indica los días de atención (ej. « Lun – Vie »).";
    }
    if (horario.to <= horario.from) {
      return "La hora de cierre debe ser posterior a la de apertura.";
    }
    return null;
  }
  if (horario.label.trim().length === 0) {
    return "Indica una etiqueta (ej. « con cita previa »).";
  }
  return null;
}

export const DEFAULT_HORARIO: HorarioPlages = {
  mode: "plages",
  days: "Lun – Vie",
  from: 480, // 08:00
  to: 1020, // 17:00
};

const DEFAULT_DISPONIBLE: HorarioDisponible = {
  mode: "disponible",
  label: "",
};

export function HorarioEditor({
  value,
  onChange,
  error,
}: {
  value: Horario;
  onChange: (next: Horario) => void;
  error?: string | null;
}) {
  // Remember the last state of each mode so toggling back and forth keeps input.
  const lastPlages = React.useRef<HorarioPlages>(
    value.mode === "plages" ? value : DEFAULT_HORARIO,
  );
  const lastDisponible = React.useRef<HorarioDisponible>(
    value.mode === "disponible" ? value : DEFAULT_DISPONIBLE,
  );

  React.useEffect(() => {
    if (value.mode === "plages") lastPlages.current = value;
    else lastDisponible.current = value;
  }, [value]);

  function handleModeChange(mode: string) {
    onChange(
      mode === "plages" ? lastPlages.current : lastDisponible.current,
    );
  }

  return (
    <div className="flex flex-col gap-3" data-slot="horario-editor">
      <Label>Horario</Label>
      <RadioGroup
        className="flex gap-6"
        value={value.mode}
        onValueChange={handleModeChange}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="plages" id="horario-plages" />
          <Label htmlFor="horario-plages" className="font-normal">
            Por horas
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="disponible" id="horario-disponible" />
          <Label htmlFor="horario-disponible" className="font-normal">
            Disponible
          </Label>
        </div>
      </RadioGroup>

      {value.mode === "plages" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="horario-days" className="text-xs font-normal">
              Días
            </Label>
            <Input
              id="horario-days"
              placeholder="Lun – Vie"
              value={value.days}
              onChange={(e) => onChange({ ...value, days: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="horario-from" className="text-xs font-normal">
              Apertura
            </Label>
            <Input
              id="horario-from"
              type="time"
              value={minutesToTime(value.from)}
              onChange={(e) =>
                onChange({ ...value, from: timeToMinutes(e.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="horario-to" className="text-xs font-normal">
              Cierre
            </Label>
            <Input
              id="horario-to"
              type="time"
              value={minutesToTime(value.to)}
              onChange={(e) =>
                onChange({ ...value, to: timeToMinutes(e.target.value) })
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="horario-label" className="text-xs font-normal">
            Etiqueta
          </Label>
          <Input
            id="horario-label"
            placeholder="con cita previa, sobre pedido…"
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
          />
        </div>
      )}

      {error && <FieldError errors={[{ message: error }]} />}
    </div>
  );
}
