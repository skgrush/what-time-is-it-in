import { computed, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeHighlightModalResizeService {

  readonly rowResizeWidthPx = 580;

  readonly #modalWidth = signal<number | undefined>(undefined);

  readonly modalSizeBoundary = computed(() => {
    const modalWidth = this.#modalWidth();

    if (modalWidth === undefined) {
      return 'n/a';
    }
    if (modalWidth >= this.rowResizeWidthPx) {
      return 'large';
    }
    return 'small';
  });

  readonly #resizeObserver = new ResizeObserver(([entry, ...others]) => {
    if (!entry) {
      this.#modalWidth.set(undefined);
      return;
    }
    if (others.length) {
      console.error('multiple highlight modals?');
    }

    const [{ inlineSize }] = entry.contentBoxSize;

    this.#modalWidth.set(inlineSize);
  });

  listen(element: HTMLElement) {
    return new Observable<void>(sub => {
      this.#resizeObserver.observe(element);

      return () => this.#resizeObserver.unobserve(element);
    });
  }
}
