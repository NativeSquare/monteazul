"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { api } from "@packages/backend/convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { getConvexErrorMessage } from "@/utils/getConvexErrorMessage";

type Category = FunctionReturnType<
  typeof api.table.commerces.getFormOptions
>["categories"][number];

type AdminCommerce = FunctionReturnType<
  typeof api.table.adminCommerces.listCommerces
>[number];

/** The public comparator: admin-curated order first, then unordered oldest first. */
function byPublicOrder(a: AdminCommerce, b: AdminCommerce): number {
  return (
    (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
      (b.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
    a._creationTime - b._creationTime
  );
}

/**
 * « Ordenar categoría »: drag-and-drop of the PUBLISHED fiches of one category
 * in their public order. Each drop persists immediately (`reorderCategory`),
 * so the public directory reflects the new order in real time. Disabled until
 * a category is picked in the table filter — the order is per category, never
 * global.
 */
export function ReorderCategoryDialog({ category }: { category: Category | "" }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open && category !== ""} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={category === ""}
          title={
            category === ""
              ? "Selecciona una categoría para ordenar sus negocios."
              : undefined
          }
        >
          <ArrowUpDown className="mr-1 size-4" />
          Ordenar categoría
        </Button>
      </DialogTrigger>
      {category !== "" && (
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ordenar «{category}»</DialogTitle>
            <DialogDescription>
              Arrastra los negocios para definir su orden en el directorio
              público. Los negocios que se publiquen después quedarán al final
              de la categoría.
            </DialogDescription>
          </DialogHeader>
          {open && <ReorderList category={category} />}
        </DialogContent>
      )}
    </Dialog>
  );
}

function ReorderList({ category }: { category: Category }) {
  const commerces = useQuery(api.table.adminCommerces.listCommerces, {
    estado: "publicado",
    category,
  });
  const reorderCategory = useMutation(api.table.adminCommerces.reorderCategory);

  const serverOrder = React.useMemo(
    () => (commerces ? [...commerces].sort(byPublicOrder) : undefined),
    [commerces],
  );

  // Local mirror of the server order for optimistic drag-and-drop; re-synced
  // whenever the reactive query pushes a new order (same idiom as the photo
  // manager).
  const [order, setOrder] = React.useState<AdminCommerce[]>([]);
  React.useEffect(() => {
    if (serverOrder) setOrder(serverOrder);
  }, [serverOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.findIndex((c) => c._id === active.id);
    const to = order.findIndex((c) => c._id === over.id);
    if (from === -1 || to === -1) return;

    const next = arrayMove(order, from, to);
    setOrder(next);
    try {
      await reorderCategory({
        category,
        orderedIds: next.map((c) => c._id),
      });
    } catch (error) {
      toast.error(getConvexErrorMessage(error));
      // The reactive query will push the untouched server order back.
    }
  }

  if (serverOrder === undefined) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (order.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        No hay negocios publicados en esta categoría.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={order.map((c) => c._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-1.5">
          {order.map((commerce, index) => (
            <SortableCommerceRow
              key={commerce._id}
              commerce={commerce}
              position={index + 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCommerceRow({
  commerce,
  position,
}: {
  commerce: AdminCommerce;
  position: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: commerce._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-slot="reorder-row"
      className="bg-background flex items-center gap-2.5 rounded-md border px-3 py-2"
    >
      <span className="text-muted-foreground w-5 shrink-0 text-sm tabular-nums">
        {position}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {commerce.name}
      </span>
      <button
        type="button"
        aria-label={`Mover ${commerce.name}`}
        className="text-muted-foreground flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  );
}
