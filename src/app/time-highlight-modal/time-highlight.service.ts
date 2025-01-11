import { computed, inject, Injectable, signal } from '@angular/core';
import { ITimeHighlight } from './time-highlight';
import { ImportExportService } from '../import-export-service/import-export.service';
import { timeHighlightToPeriodString } from './time-utils';

@Injectable({
  providedIn: 'root'
})
export class TimeHighlightService {
  readonly #importExportService = inject(ImportExportService);

  readonly #highlightIdPrefix = 'highlight-row-';

  readonly #highlights = signal(this.#highlightsInitializer());
  readonly highlights = this.#highlights.asReadonly();

  readonly nextId = computed(() => {
    const nextNumber = this.#highlights().length + 1;

    return `${this.#highlightIdPrefix}${nextNumber}`;
  });

  change(oldHighlight: ITimeHighlight, newHighlight: ITimeHighlight) {
    this.#highlights.update(existingHighlights => {
      const idx = existingHighlights.indexOf(oldHighlight);
      if (idx === -1 || oldHighlight.id !== newHighlight.id) {
        throw new Error(`change() received a highlight (${oldHighlight.id}->${newHighlight.id}, idx=${idx}) that's missing or changed-id`);
      }
      const copy = [...existingHighlights];

      copy[idx] = newHighlight;
      return copy;
    });
  }

  add(highlight: ITimeHighlight) {
    highlight = { ...highlight, id: this.nextId() };
    this.#highlights.update(h => [...h, highlight]);
  }

  delete(oldHighlight: ITimeHighlight) {
    this.#highlights.update(existingHighlights => {
      const idx = existingHighlights.indexOf(oldHighlight);
      if (idx === -1) {
        throw new Error(`delete received a missing highlight (${oldHighlight.id})`);
      }
      return existingHighlights.toSpliced(idx, 1);
    })
  }

  getHighlightsForUrl() {
    return this.#highlights().map(highlight => timeHighlightToPeriodString(highlight));
  }

  #highlightsInitializer(): readonly ITimeHighlight[] {
    return this.#importExportService
      .getValidTimeHighlightsFromQueryParams()
      .map(({ start, end }, idx) => ({
        id: `${this.#highlightIdPrefix}${idx + 1}`,
        start,
        end,
      }));
  }
}
