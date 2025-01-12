import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ZoneNormalizerService {

  readonly #isServerSide = isPlatformServer(inject(PLATFORM_ID));

  readonly #normalizedZoneCache = new Map<ITimeZoneName, null | ITimeZoneName>();

  readonly initialDate = this.#isServerSide ? new Date(946684800000) : new Date();

  readonly browserOutputsCldrNames = (() => {
      return (
        this.#normalizeUncached('America/Argentina/Buenos_Aires') === 'America/Buenos_Aires' ||
        this.#normalizeUncached('Asia/Ho_Chi_Minh') === 'Asia/Saigon'
      );
  })();

  getMyBrowserTimeZone() {
    if (this.#isServerSide) {
      return 'UTC';
    } else {
      return Intl.DateTimeFormat().resolvedOptions().timeZone as ITimeZoneName;
    }
  }

  getAllBrowserZones(): ReadonlySet<ITimeZoneName> {
    if (this.#isServerSide) {
      return new Set(['UTC'] as const);
    } else {
      return new Set(Intl.supportedValuesOf('timeZone') as ITimeZoneName[]).add('UTC')
    }
  }

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
