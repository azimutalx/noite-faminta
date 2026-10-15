import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../src/state/store.js';
import { renderApp } from '../src/main.js';

// Implementação leve de Mock DOM para validar hierarquia de nós e anti-thrashing
class MockElement {
  public id: string;
  public tagName: string;
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public parent: MockElement | null = null;
  public eventListeners: Record<string, Function[]> = {};
  private _innerHTML: string = '';

  constructor(tagName: string, id: string = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set innerHTML(html: string) {
    this._innerHTML = html;
    // Parse element id tags presentes no html
    const idMatches = [...html.matchAll(/id="([^"]+)"/g)];
    const createdChildren: MockElement[] = [];
    for (const match of idMatches) {
      const childId = match[1];
      const tagMatch = html.match(new RegExp(`<([a-zA-Z0-9]+)[^>]*id="${childId}"`));
      const childTag = tagMatch ? tagMatch[1] : 'div';
      const child = new MockElement(childTag, childId);
      child.parent = this;
      createdChildren.push(child);
    }
    this.children = createdChildren;
  }

  querySelector<T extends MockElement>(selector: string): T | null {
    if (selector.startsWith('#')) {
      const targetId = selector.slice(1);
      if (this.id === targetId) return this as unknown as T;
      for (const child of this.children) {
        if (child.id === targetId) return child as unknown as T;
        const found = child.querySelector<T>(selector);
        if (found) return found;
      }
    }
    return null;
  }

  querySelectorAll<T extends MockElement>(_selector: string): T[] {
    return [] as T[];
  }

  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }
}

describe('packages/client: Validação da Hierarquia DOM e Anti-Thrashing', () => {
  let mockRoot: MockElement;

  beforeEach(() => {
    mockRoot = new MockElement('DIV', 'app');
    (globalThis as any).document = {
      getElementById: (id: string) => {
        if (id === 'app') return mockRoot;
        return null;
      }
    };
  });

  it('renderApp deve montar a casca estática (header, ticker, main, footer) na primeira execução', () => {
    const state = store.getState();
    renderApp(state);

    const header = mockRoot.querySelector('#app-header');
    const ticker = mockRoot.querySelector('#app-ticker-container');
    const main = mockRoot.querySelector('#main-content');
    const footer = mockRoot.querySelector('#app-footer');

    expect(header).toBeDefined();
    expect(ticker).toBeDefined();
    expect(main).toBeDefined();
    expect(footer).toBeDefined();
  });

  it('renderApp NÃO deve aniquilar a árvore de nós principais em chamadas subsequentes (Anti-Thrashing)', () => {
    const state = store.getState();
    renderApp(state);

    const headerRef1 = mockRoot.querySelector('#app-header');
    const tickerRef1 = mockRoot.querySelector('#app-ticker-container');
    const mainRef1 = mockRoot.querySelector('#main-content');
    const footerRef1 = mockRoot.querySelector('#app-footer');

    // Executar novo render com atualização de estado (adicionando um log)
    store.addLog('Mensagem de teste de evento rápido', 'info');
    renderApp(store.getState());

    const headerRef2 = mockRoot.querySelector('#app-header');
    const tickerRef2 = mockRoot.querySelector('#app-ticker-container');
    const mainRef2 = mockRoot.querySelector('#main-content');
    const footerRef2 = mockRoot.querySelector('#app-footer');

    // A referência dos nós pais da casca deve ser idêntica, comprovando que o root.innerHTML não foi limpo!
    expect(headerRef1).toBe(headerRef2);
    expect(tickerRef1).toBe(tickerRef2);
    expect(mainRef1).toBe(mainRef2);
    expect(footerRef1).toBe(footerRef2);
  });

  it('ticker deve conter a mensagem mais recente do console sem quebrar a casca', () => {
    store.addLog('Alerta do inquisidor Malachi nas catacumbas!', 'danger');
    renderApp(store.getState());

    const ticker = mockRoot.querySelector('#app-ticker-container');
    expect(ticker).toBeDefined();
    expect(ticker?.innerHTML).toContain('Alerta do inquisidor Malachi nas catacumbas!');
    expect(ticker?.innerHTML).toContain('danger');
  });
});
