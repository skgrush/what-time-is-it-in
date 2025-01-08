import { Injectable } from '@angular/core';
import { ITimeZoneName } from '../types/region-zone-mapping';

@Injectable({
  providedIn: 'root'
})
export class ZoneNormalizerService {

  readonly #normalizedZoneCache = new Map<ITimeZoneName, null | ITimeZoneName>();

  readonly browserOutputsCldrNames = (() => {
      return this.#normalizeUncached('America/Argentina/Buenos_Aires') === 'America/Buenos_Aires';
  })();

  /**
   * Accepts either IANA or CLDR timezone names and returns what the browser prefers.
   */
  normalize(zone: ITimeZoneName) {
    const result = this.#normalizedZoneCache.get(zone);
    if (result !== undefined) {
      return result;
    }
    const normalized = this.#normalizeUncached(zone);
    this.#normalizedZoneCache.set(zone, normalized);
    if (normalized && zone !== normalized) {
      this.#normalizedZoneCache.set(normalized, normalized);
    }

    return normalized;
  }

  #normalizeUncached(timeZone: ITimeZoneName) {
    try {
      return new Intl.DateTimeFormat(undefined, { timeZone }).resolvedOptions().timeZone as ITimeZoneName;
    } catch {
      return null;
    }
  }
}
