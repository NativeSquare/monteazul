"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MAX_PHOTO_MB } from "@packages/backend/convex/lib/photos";

import { Button } from "@/components/ui/button";

/**
 * Local photo selection for the fiche wizard: the Commerce does not exist yet,
 * so files are only PICKED here (with object-URL previews) and uploaded at
 * submission time — abandoning the wizard never leaves orphan blobs in storage.
 * Controlled component: `value`/`onChange`. Selection order is the vitrine
 * order (first = « Portada »), reorderable by the same drag-and-drop as the
 * « Mi negocio » photo manager.
 */

export type PickedPhoto = {
  /** Local identity of the selection (not a storage id — nothing is uploaded yet). */
  id: string;
  file: File;
  previewUrl: string;
};

export function PhotoPicker({
  value,
  onChange,
}: {
  value: PickedPhoto[];
  onChange: (next: PickedPhoto[]) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const counter = React.useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Revoke every preview URL on unmount (removals revoke eagerly below).
  const latest = React.useRef(value);
  React.useEffect(() => {
    latest.current = value;
  }, [value]);
  React.useEffect(
    () => () => {
      for (const photo of latest.current) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    },
    [],
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const picked: PickedPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" no es una imagen.`);
        continue;
      }
      counter.current += 1;
      picked.push({
        id: `picked-${counter.current}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (picked.length > 0) onChange([...value, ...picked]);
  }

  function handleRemove(id: string) {
    const removed = value.find((photo) => photo.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(value.filter((photo) => photo.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = value.findIndex((photo) => photo.id === active.id);
    const to = value.findIndex((photo) => photo.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(value, from, to));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          Arrastra para reordenar: la primera foto es la portada de tu negocio.
          Máximo {MAX_PHOTO_MB} MB por imagen.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="mr-2 size-4" />
          Añadir fotos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {value.length === 0 ? (
        <div className="border-muted-foreground/25 text-muted-foreground flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm">
          <ImagePlus className="size-6" />
          Aún no has añadido fotos.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((photo) => photo.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {value.map((photo, index) => (
                <SortablePickedPhoto
                  key={photo.id}
                  photo={photo}
                  isCover={index === 0}
                  onRemove={() => handleRemove(photo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortablePickedPhoto({
  photo,
  isCover,
  onRemove,
}: {
  photo: PickedPhoto;
  isCover: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-slot="photo-tile"
      className="bg-muted relative aspect-square overflow-hidden rounded-lg border"
    >
      {/* Object URLs are local previews — next/image cannot optimise them. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.previewUrl}
        alt="Foto del negocio"
        className="size-full object-cover"
      />

      {isCover && (
        <span className="bg-primary text-primary-foreground absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium">
          Portada
        </span>
      )}

      <button
        type="button"
        aria-label="Mover foto"
        className="bg-background/80 text-foreground absolute right-1.5 top-1.5 flex size-6 cursor-grab touch-none items-center justify-center rounded active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        aria-label="Eliminar foto"
        className="absolute bottom-1.5 right-1.5 size-6"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
