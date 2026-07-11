"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { PHOTO_PLACEHOLDER_GRADIENT } from "@/lib/commerce-media";

/**
 * Swipeable photo carousel of the Commerce detail screen, faithful to the
 * Claude Design prototype: full-width horizontally-scrolling, snap-aligned
 * slides with position dots that track the active photo. On desktop (no touch
 * swipe) previous/next arrows overlay the photo. Every photo slide carries a
 * zoom affordance (bottom-right) and opens a full-screen viewer
 * (object-contain, so nothing is cropped) with wheel / double-click / pinchless
 * pan-zoom for desktop. When a Commerce has no photo yet, a single gradient
 * placeholder slide is shown (no dots, no arrows, no viewer).
 */
export function PhotoCarousel({
  name,
  photos,
}: {
  name: string;
  photos: string[];
}) {
  const [active, setActive] = React.useState(0);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const hasPhotos = photos.length > 0;
  // `null` marks the gradient placeholder slide used when there is no photo.
  const slides: (string | null)[] = hasPhotos ? photos : [null];

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    if (el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive((prev) => (prev === index ? prev : index));
  }

  function scrollTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex h-[300px] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:h-[440px]"
      >
        {slides.map((photo, index) => (
          <div
            key={photo ?? "placeholder"}
            data-testid="carousel-slide"
            data-placeholder={photo === null}
            className="relative flex h-[300px] w-full flex-none snap-center items-center justify-center overflow-hidden lg:h-[440px]"
            style={
              photo === null
                ? { background: PHOTO_PLACEHOLDER_GRADIENT }
                : undefined
            }
          >
            {photo !== null ? (
              <button
                type="button"
                aria-label={`Ver la foto ${index + 1} en pantalla completa`}
                onClick={() => setViewerIndex(index)}
                className="absolute inset-0 cursor-zoom-in"
              >
                <Image
                  src={photo}
                  alt={`${name} — foto ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 512px, 480px"
                  className="object-cover"
                  priority={index === 0}
                />
                {/* Affordance: the photo opens full screen. Bottom-right — the
                    heart sits top-right and the back button top-left. */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-3.5 right-3.5 flex size-9 items-center justify-center rounded-full bg-black/45 text-white"
                >
                  <ZoomIn className="size-[18px]" strokeWidth={2.2} />
                </span>
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Desktop arrows — touch users swipe; mouse users click. */}
      {slides.length > 1 ? (
        <>
          <CarouselArrow
            direction="prev"
            disabled={active === 0}
            onClick={() => scrollTo(active - 1)}
          />
          <CarouselArrow
            direction="next"
            disabled={active === slides.length - 1}
            onClick={() => scrollTo(active + 1)}
          />
        </>
      ) : null}

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5">
          {slides.map((photo, index) => (
            <span
              key={photo ?? index}
              data-testid="carousel-dot"
              data-active={index === active}
              className={cn(
                "h-1.5 rounded-pill transition-all",
                index === active ? "w-[18px] bg-white" : "w-1.5 bg-white/60",
              )}
            />
          ))}
        </div>
      ) : null}

      {viewerIndex !== null && hasPhotos ? (
        <PhotoViewer
          name={name}
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Foto anterior" : "Foto siguiente"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-1/2 hidden size-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-[0_2px_8px_rgba(20,30,50,0.18)] transition-opacity lg:flex",
        direction === "prev" ? "left-4" : "right-4",
        disabled && "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-5" strokeWidth={2.4} />
    </button>
  );
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

/**
 * Full-screen photo viewer: object-contain (nothing cropped), previous/next
 * arrows, keyboard navigation (←/→/Escape) and a position counter. Desktop
 * gets real zoom — mouse wheel anchored at the cursor, +/− buttons, double
 * click to toggle, drag to pan while zoomed. Locks the page scroll while open.
 */
function PhotoViewer({
  name,
  photos,
  initialIndex,
  onClose,
}: {
  name: string;
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = React.useState(initialIndex);
  const [view, setView] = React.useState({ scale: 1, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{
    startX: number;
    startY: number;
    tx: number;
    ty: number;
    moved: boolean;
  } | null>(null);
  const count = photos.length;

  const goTo = React.useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(count - 1, next)));
      setView({ scale: 1, tx: 0, ty: 0 });
    },
    [count],
  );

  /** Rescale around a screen point, keeping that point visually anchored. */
  const zoomBy = React.useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      setView((prev) => {
        const el = containerRef.current;
        const scale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, prev.scale * factor),
        );
        if (scale === 1 || !el) return { scale, tx: 0, ty: 0 };
        const rect = el.getBoundingClientRect();
        // Cursor offset from the container centre (the transform origin).
        const px = (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
        const py = (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
        const ratio = scale / prev.scale;
        const maxX = ((scale - 1) * rect.width) / 2;
        const maxY = ((scale - 1) * rect.height) / 2;
        return {
          scale,
          tx: Math.max(-maxX, Math.min(maxX, px - ratio * (px - prev.tx))),
          ty: Math.max(-maxY, Math.min(maxY, py - ratio * (py - prev.ty))),
        };
      });
    },
    [],
  );

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, onClose]);

  // Wheel zoom needs preventDefault, and React registers wheel listeners as
  // passive — so attach a native, non-passive listener.
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? 1.25 : 0.8, event.clientX, event.clientY);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  // Lock the page scroll behind the viewer.
  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (view.scale === 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      tx: view.tx,
      ty: view.ty,
      moved: false,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    const el = containerRef.current;
    if (!start || !el) return;
    const rect = el.getBoundingClientRect();
    const maxX = ((view.scale - 1) * rect.width) / 2;
    const maxY = ((view.scale - 1) * rect.height) / 2;
    const dx = event.clientX - start.startX;
    const dy = event.clientY - start.startY;
    if (Math.abs(dx) + Math.abs(dy) > 2) start.moved = true;
    setView((prev) => ({
      scale: prev.scale,
      tx: Math.max(-maxX, Math.min(maxX, start.tx + dx)),
      ty: Math.max(-maxY, Math.min(maxY, start.ty + dy)),
    }));
  }

  function onPointerUp() {
    drag.current = null;
    setIsDragging(false);
  }

  return (
    <div
      data-testid="photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative h-full w-full touch-pan-y overflow-hidden",
          view.scale > 1
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-zoom-in",
        )}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) =>
          view.scale > 1
            ? setView({ scale: 1, tx: 0, ty: 0 })
            : zoomBy(2.5, event.clientX, event.clientY)
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
            transformOrigin: "center center",
            transition: isDragging ? undefined : "transform 120ms ease-out",
          }}
        >
          <Image
            src={photos[index]}
            alt={`${name} — foto ${index + 1} de ${count}`}
            fill
            sizes="100vw"
            className="select-none object-contain"
            draggable={false}
            priority
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute right-4 top-4 flex size-[38px] items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
      >
        <X className="size-5" strokeWidth={2.4} />
      </button>

      {/* Zoom controls — mainly for mouse users (wheel/double-click also work). */}
      <div className="absolute left-4 top-4 flex gap-2">
        <button
          type="button"
          aria-label="Acercar"
          onClick={() => zoomBy(1.5)}
          disabled={view.scale >= MAX_SCALE}
          className="flex size-[38px] items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm disabled:opacity-30"
        >
          <ZoomIn className="size-5" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="Alejar"
          onClick={() => zoomBy(1 / 1.5)}
          disabled={view.scale <= MIN_SCALE}
          className="flex size-[38px] items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm disabled:opacity-30"
        >
          <ZoomOut className="size-5" strokeWidth={2.2} />
        </button>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(event) => {
              event.stopPropagation();
              goTo(index - 1);
            }}
            disabled={index === 0}
            className={cn(
              "absolute left-3 top-1/2 flex size-[42px] -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm",
              index === 0 && "pointer-events-none opacity-30",
            )}
          >
            <ChevronLeft className="size-6" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={(event) => {
              event.stopPropagation();
              goTo(index + 1);
            }}
            disabled={index === count - 1}
            className={cn(
              "absolute right-3 top-1/2 flex size-[42px] -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm",
              index === count - 1 && "pointer-events-none opacity-30",
            )}
          >
            <ChevronRight className="size-6" strokeWidth={2.4} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-pill bg-white/15 px-3 py-1 text-[13px] font-semibold text-white backdrop-blur-sm">
            {index + 1} / {count}
          </div>
        </>
      ) : null}
    </div>
  );
}
