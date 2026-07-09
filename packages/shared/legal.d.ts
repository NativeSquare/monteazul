/**
 * Type declarations for `legal.js` — the shared legal documents of the
 * Plataforma (Términos y Condiciones, Política de Privacidad). Hand-written so
 * the app renderers get a precise block union instead of loose `string`s.
 */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  subtitle: string;
  /** Human-readable Spanish date, e.g. "10 de julio de 2026". */
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
};

export declare const TERMINOS: LegalDoc;
export declare const PRIVACIDAD: LegalDoc;
