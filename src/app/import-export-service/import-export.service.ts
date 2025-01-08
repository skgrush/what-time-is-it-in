import { inject, Injectable } from '@angular/core';
import { LOCATION } from '../tokens/location';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { HISTORY } from '../tokens/history';
import { CLIPBOARD } from '../tokens/clipboard';
import { ZoneNormalizerService } from '../zone-normalizer-service/zone-normalizer.service';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  readonly #zoneValidator = inject(ZoneNormalizerService);
  readonly #location = inject(LOCATION);
  readonly #history = inject(HISTORY);
  readonly #clipboard = inject(CLIPBOARD);

  static readonly queryParamZone = 'zone';

  /**
   * Attempt to read zone= query params and filters them against the set of `allValidZones` passed in.
   *
   * If global location is unreachable (e.g. server-side), returns `[]`.
   */
  getValidZonesFromQueryParams() {
    if (!this.#location?.search.includes(`${ImportExportService.queryParamZone}=`)) {
      return [];
    }

    const queryParams = new URLSearchParams(this.#location.search);

    const unvalidatedZones = queryParams.getAll(ImportExportService.queryParamZone) as ITimeZoneName[];
    const validatedZones = unvalidatedZones.filter((z) => !!this.#zoneValidator.normalize(z));

    if (unvalidatedZones.length !== validatedZones.length) {
      console.error('Query param included invalid zone(s)', unvalidatedZones.filter(v => !validatedZones.includes(v)));
    }

    return validatedZones;
  }

  updatePageUrlWithZones(zones: readonly ITimeZoneName[]) {
    if (!this.#location) {
      return;
    }

    const newPathString = '/?' + new URLSearchParams(
      zones.map(zone => [
        ImportExportService.queryParamZone,
        zone
      ])
    );

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
