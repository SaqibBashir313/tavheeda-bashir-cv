/**
 * Dependency-free text splitter for mask-based reveals.
 *
 * Why not GSAP's SplitText? This is ~2 kB, has no licence surface, and is
 * built around the exact structure our masks need:
 *
 *     <span data-split-mask>      ← overflow:hidden, the "window"
 *       <span data-split>Word</span>  ← the thing GSAP translates
 *     </span>
 *
 * Accessibility: the caller (`<AnimatedText />`) renders a visually-hidden copy
 * of the real text and marks the split DOM `aria-hidden`, so screen readers
 * read one clean sentence instead of 40 disconnected letters.
 *
 * Limitation (deliberate): operates on `textContent`, so nested inline markup
 * inside the target is flattened. Split the leaf elements, not a container.
 */

export type SplitUnit = 'char' | 'word' | 'line';

export interface SplitOptions {
  unit: SplitUnit;
  /** Wrap each unit in an overflow-hidden window. Off = plain fade/slide. */
  mask?: boolean;
}

export interface SplitHandle {
  /** The elements to animate, in document order. */
  targets: HTMLElement[];
  /** Restores the original markup. Always call this on cleanup. */
  revert: () => void;
}

const MASK_ATTR = 'data-split-mask';
const UNIT_ATTR = 'data-split';

/** Descenders (g, y, p) would be clipped by a tight mask; bleed then pull back. */
const DESCENDER_BLEED = '0.14em';

function createMask(display: 'inline-block' | 'block'): HTMLSpanElement {
  const mask = document.createElement('span');
  mask.setAttribute(MASK_ATTR, '');
  mask.style.display = display;
  mask.style.overflow = 'hidden';
  mask.style.paddingBottom = DESCENDER_BLEED;
  mask.style.marginBottom = `-${DESCENDER_BLEED}`;
  if (display === 'inline-block') mask.style.verticalAlign = 'top';
  return mask;
}

function createUnit(unit: SplitUnit, text?: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.setAttribute(UNIT_ATTR, unit);
  span.style.display = unit === 'line' ? 'block' : 'inline-block';
  if (unit === 'char') span.style.whiteSpace = 'pre';
  if (text !== undefined) span.textContent = text;
  return span;
}

/** Wraps `node` in a mask, in place. */
function wrapInMask(node: HTMLElement, display: 'inline-block' | 'block'): void {
  const parent = node.parentNode;
  if (!parent) return;
  const mask = createMask(display);
  parent.insertBefore(mask, node);
  mask.appendChild(node);
}

/** Splits text into word spans separated by real space text nodes. */
function buildWords(text: string): { fragment: DocumentFragment; words: HTMLSpanElement[] } {
  const fragment = document.createDocumentFragment();
  const words: HTMLSpanElement[] = [];

  for (const token of text.split(/(\s+)/)) {
    if (!token) continue;
    if (/^\s+$/.test(token)) {
      fragment.appendChild(document.createTextNode(' '));
      continue;
    }
    const word = createUnit('word', token);
    words.push(word);
    fragment.appendChild(word);
  }

  return { fragment, words };
}

/** Replaces a word span's text with per-character spans. */
function explodeWordIntoChars(word: HTMLSpanElement, mask: boolean): HTMLSpanElement[] {
  const text = word.textContent ?? '';
  const chars: HTMLSpanElement[] = [];

  word.textContent = '';
  word.style.whiteSpace = 'nowrap';

  // `Intl.Segmenter` keeps emoji and combining marks intact — naive
  // `split('')` would tear "👩‍💻" or "é" into broken pieces.
  const graphemes = segmentGraphemes(text);

  for (const grapheme of graphemes) {
    const char = createUnit('char', grapheme);
    chars.push(char);
    word.appendChild(char);
    if (mask) wrapInMask(char, 'inline-block');
  }

  return chars;
}

function segmentGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

/**
 * Groups already-rendered word spans into visual lines by their vertical
 * offset. This is the one place we force a synchronous layout read — it
 * happens inside `useLayoutEffect`, once, before paint.
 */
function groupWordsIntoLines(words: HTMLSpanElement[]): HTMLSpanElement[][] {
  const lines: HTMLSpanElement[][] = [];
  let lastTop: number | null = null;

  for (const word of words) {
    const top = Math.round(word.getBoundingClientRect().top);
    // 2px tolerance absorbs sub-pixel rounding across font metrics.
    if (lastTop === null || Math.abs(top - lastTop) > 2) {
      lines.push([word]);
      lastTop = top;
    } else {
      lines[lines.length - 1]?.push(word);
    }
  }

  return lines;
}

export function splitText(element: HTMLElement, options: SplitOptions): SplitHandle {
  const { unit, mask = true } = options;
  const originalHTML = element.innerHTML;
  const revert = () => {
    element.innerHTML = originalHTML;
  };

  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return { targets: [], revert };

  const { fragment, words } = buildWords(text);
  element.replaceChildren(fragment);

  if (unit === 'word') {
    if (mask) words.forEach((word) => wrapInMask(word, 'inline-block'));
    return { targets: words, revert };
  }

  if (unit === 'char') {
    const chars = words.flatMap((word) => explodeWordIntoChars(word, mask));
    return { targets: chars, revert };
  }

  // unit === 'line': measure the natural wrap, then rebuild around it.
  const lines = groupWordsIntoLines(words);
  const lineFragment = document.createDocumentFragment();
  const lineTargets: HTMLSpanElement[] = [];

  for (const lineWords of lines) {
    const line = createUnit('line');
    lineWords.forEach((word, index) => {
      if (index > 0) line.appendChild(document.createTextNode(' '));
      // Inner words no longer need to be inline-block once the line is the
      // animated unit; let them flow as normal text.
      word.style.display = 'inline';
      line.appendChild(word);
    });
    lineTargets.push(line);
    lineFragment.appendChild(line);
    if (mask) {
      const maskEl = createMask('block');
      lineFragment.insertBefore(maskEl, line);
      maskEl.appendChild(line);
    }
  }

  element.replaceChildren(lineFragment);
  return { targets: lineTargets, revert };
}
