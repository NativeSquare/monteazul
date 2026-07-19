"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown, Copy, Share, SquarePlus, Star, X } from "lucide-react";

/** Snooze after a dismissal — the banner must invite, not nag. */
const DISMISS_KEY = "monteazul-install-dismissed-at";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS ships a macOS user agent — the touch points give it away.
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  );
}

function recentlyDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** A circled highlight around the element the user must tap (as in the
 *  reference screenshots — Ronda 13 #3). */
function TapTarget({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full p-1.5 text-[#1F3149] ring-2 ring-[#1F3149]">
      {children}
    </span>
  );
}

/** One numbered step of the iOS walkthrough: mockup on top, caption below. */
function IosStep({
  number,
  caption,
  children,
}: {
  number: number;
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1F3149] text-[13px] font-bold text-[#ECE9E0]">
          {number}
        </span>
        <p className="text-[13.5px] leading-snug text-neutral-700">{caption}</p>
      </div>
      <div className="rounded-xl bg-[#F2F2F7] p-3">{children}</div>
    </li>
  );
}

/**
 * The iOS visual walkthrough modal — Safari has no install event, so the user
 * must do the gesture themselves; the three mocked-up screens mirror the flow
 * on their phone: Compartir → Ver más → Añadir a pantalla de inicio.
 */
function IosInstallSteps({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-3 sm:items-center"
      onClick={onClose}
      data-testid="ios-install-steps"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cómo instalar Cerka en tu iPhone"
        className="max-h-[85vh] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-white p-5 text-neutral-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[17px] font-bold leading-tight text-[#1F3149]">
            Instala Cerka en tu iPhone
          </h2>
          <button
            type="button"
            aria-label="Cerrar instrucciones"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-neutral-500"
          >
            <X className="size-4" />
          </button>
        </div>

        <ol className="flex flex-col gap-4">
          <IosStep
            number={1}
            caption={
              <>
                En Safari, toca el botón <strong>Compartir</strong> junto a la
                barra de dirección.
              </>
            }
          >
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
              <span className="flex-1 truncate text-[13px] text-neutral-500">
                cerka.vercel.app
              </span>
              <TapTarget>
                <Share className="size-4" />
              </TapTarget>
            </div>
          </IosStep>

          <IosStep
            number={2}
            caption={
              <>
                Si no ves la opción, desliza el menú y toca{" "}
                <strong>« Ver más »</strong>.
              </>
            }
          >
            <div className="flex items-start justify-between gap-2">
              {[
                { icon: <Copy className="size-4" />, label: "Copiar" },
                { icon: <Star className="size-4" />, label: "Marcadores" },
              ].map((action) => (
                <span
                  key={action.label}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-white text-neutral-600 shadow-sm">
                    {action.icon}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {action.label}
                  </span>
                </span>
              ))}
              <span className="flex flex-col items-center gap-1">
                <TapTarget>
                  <ChevronDown className="size-4" />
                </TapTarget>
                <span className="text-[10px] font-semibold text-[#1F3149]">
                  Ver más
                </span>
              </span>
            </div>
          </IosStep>

          <IosStep
            number={3}
            caption={
              <>
                Toca <strong>« Añadir a pantalla de inicio »</strong> y confirma.
              </>
            }
          >
            <div className="divide-y divide-neutral-100 overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between px-3 py-2.5 text-[13px] text-neutral-400">
                <span>Añadir a marcadores</span>
                <Star className="size-4" />
              </div>
              <div className="flex items-center justify-between bg-[#1F3149]/5 px-3 py-2.5 text-[13px] font-semibold text-[#1F3149] ring-2 ring-inset ring-[#1F3149]">
                <span>Añadir a pantalla de inicio</span>
                <SquarePlus className="size-4" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 text-[13px] text-neutral-400">
                <span>Copiar</span>
                <Copy className="size-4" />
              </div>
            </div>
          </IosStep>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#1F3149] py-3 text-[14px] font-bold text-[#ECE9E0]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

/**
 * PWA bootstrap of the public directory: registers the offline service worker
 * and shows the « add to home screen » invitation banner.
 *
 * - Android/Chrome fires `beforeinstallprompt`: we hold the event and the
 *   banner's «Instalar» button triggers the REAL native install prompt.
 * - iOS Safari has no install event: the banner's «Ver cómo» button opens a
 *   visual step-by-step walkthrough (Compartir → Ver más → Añadir a pantalla
 *   de inicio), device-detected — Ronda 13 #3.
 * - Never shown inside the installed app (standalone) and snoozed for 14 days
 *   after a dismissal.
 */
export function PwaInstallBanner() {
  const [mode, setMode] = React.useState<"hidden" | "android" | "ios">("hidden");
  const [showIosSteps, setShowIosSteps] = React.useState(false);
  const deferredPrompt = React.useRef<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline fallback unavailable — the live site works regardless.
      });
    }

    if (isStandalone() || recentlyDismissed()) return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setMode("android");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if (isIos()) setMode("ios");

    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (mode === "hidden") return null;

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Storage unavailable — the banner simply reappears next visit.
    }
    setShowIosSteps(false);
    setMode("hidden");
  }

  async function install() {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setMode("hidden");
    else dismiss();
  }

  return (
    <>
      <div
        role="dialog"
        aria-label="Instalar la aplicación"
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[440px] rounded-2xl bg-[#1F3149] p-3.5 text-[#ECE9E0] shadow-[0_8px_30px_rgba(20,30,50,0.45)]"
      >
        <div className="flex items-center gap-3">
          {/* Thin white keyline so the cream logo reads apart from the cream
              «Instalar» button (Ronda 13 #5 — keep the button as is). */}
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-xl ring-1 ring-white"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold leading-tight">Instala Cerka</p>
            <p className="mt-0.5 text-[12.5px] leading-snug opacity-85">
              {mode === "android"
                ? "Añádelo a tu pantalla de inicio para abrirlo como una app."
                : "Añádelo a tu pantalla de inicio desde Safari en tres pasos."}
            </p>
          </div>
          {mode === "android" ? (
            <button
              type="button"
              onClick={() => void install()}
              className="shrink-0 rounded-xl bg-[#ECE9E0] px-4 py-2 text-[13px] font-bold text-[#1F3149]"
            >
              Instalar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowIosSteps(true)}
              className="shrink-0 rounded-xl bg-[#ECE9E0] px-4 py-2 text-[13px] font-bold text-[#1F3149]"
            >
              Ver cómo
            </button>
          )}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={dismiss}
            className="shrink-0 rounded-full p-1.5 opacity-70"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {showIosSteps ? (
        <IosInstallSteps onClose={() => setShowIosSteps(false)} />
      ) : null}
    </>
  );
}
