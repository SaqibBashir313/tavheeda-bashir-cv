export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Formatters are created once at module scope — `Intl` constructors are slow. */
export function formatNumber(value: number, compact = false): string {
  return compact ? compactFormatter.format(value) : numberFormatter.format(value);
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${String(count)} ${count === 1 ? singular : plural}`;
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}
