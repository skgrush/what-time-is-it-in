import { inject, Injectable } from '@angular/core';
import { LOCATION } from '../tokens/location';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { HISTORY } from '../tokens/history';
import { CLIPBOARD } from '../tokens/clipboard';
import { ZoneNormalizerService } from '../zone-normalizer-service/zone-normalizer.service';
import { periodStringToTimeHighlight } from '../time-highlight-modal/time-utils';
import { ITimeHighlight } from '../time-highlight-modal/time-highlight';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  readonly #zoneValidator = inject(ZoneNormalizerService);
  readonly #location = inject(LOCATION);
  readonly #history = inject(HISTORY);
  readonly #clipboard = inject(CLIPBOARD);

  readonly #queryParams = this.#location ? new URLSearchParams(this.#location.search) : undefined;

  static readonly queryParamZone = 'zone';
  static readonly queryParamTimeHighlight = 'highlight';

  getValidTimeHighlightsFromQueryParams(): readonly ITimeHighlight[] {
    const unvalidatedTimeHighlights = this.#queryParams?.getAll(ImportExportService.queryParamTimeHighlight);
    if (!unvalidatedTimeHighlights?.length) {
      return [];
    }

    const validatedTimeHighlights = unvalidatedTimeHighlights
      .map((value, idx) => {
        try {
          return periodStringToTimeHighlight(idx.toString(), value);
        } catch (e) {
          console.error(e);
          return null;
        }
      })
      .filter(v => v !== null);

    return validatedTimeHighlights;
  }

  /**
   * Attempt to read zone= query params and filters them against the set of `allValidZones` passed in.
   *
   * If global location is unreachable (e.g. server-side), returns `[]`.
   */
  getValidZonesFromQueryParams() {
    const unvalidatedZones = this.#queryParams?.getAll(ImportExportService.queryParamZone) as ITimeZoneName[];
    if (!unvalidatedZones?.length) {
      return [];
    }

    const validatedZones = unvalidatedZones.filter((z) => !!this.#zoneValidator.normalize(z));

    if (unvalidatedZones.length !== validatedZones.length) {
      console.error('Query param included invalid zone(s)', unvalidatedZones.filter(v => !validatedZones.includes(v)));
    }

    return validatedZones;
  }

  updatePageUrlWithZones(
    zones: readonly ITimeZoneName[],
    highlights: readonly string[],
  ) {
    if (!this.#location) {
      return;
    }

    const urlParts = [
      ...zones.map(zone => [
        ImportExportService.queryParamZone,
        zone
      ] as const),
      ...highlights.map(highlight => [
        ImportExportService.queryParamTimeHighlight,
        highlight
      ] as const),
    ];

    // const newPathString = '/?' + new URLSearchParams(urlParts);

    const newPathString = '/?' + urlParts.map(([key, value]) =>
      `${key}=${value}`
    ).join('&');

    const url = new globalThis.URL(newPathString, this.#location.origin);

    if (this.#history) {
      this.#history.pushState(undefined, '', url);
    }

    return url;
  }

  async copyUrlToClipboard(url: URL): Promise<boolean> {
    return this.copyTextToClipboard(url.toString());
  }

  async copyTextToClipboard(text: string) {
    if (!this.#clipboard) {
      return false;
    }
    try {
      await this.#clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
