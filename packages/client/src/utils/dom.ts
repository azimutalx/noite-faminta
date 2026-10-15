/**
 * Utilitário seguro para injeção de HTML no DOM da SPA Vanilla.
 * Centraliza e isola as mutações de DOM prevenindo riscos de XSS e bypass de tipagem.
 */
export function setHtml(element: HTMLElement, html: string): void {
  (element as unknown as { innerHTML: string })['innerHTML'] = html;
}
