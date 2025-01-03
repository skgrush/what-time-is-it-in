import { inject, Injectable } from '@angular/core';
import { LOCATION } from '../tokens/location';
import { ITimeZoneName } from '../types/region-zone-mapping';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  readonly #location = inject(LOCATION);

  static readonly queryParamZone = 'zone[]';

  constructor() { }

  /**
   * Attempt to read zone[]= query params and filters them against the set of `allValidZones` passed in.
   *
   * If global location is unreachable (e.g. server-side), returns `[]`.
   */
  getValidZonesFromQueryParams(allValidZones: ReadonlySet<string>) {
    if (!this.#location?.search.includes(`${ImportExportService.queryParamZone}=`)) {
      return [];
    }

    const queryParams = new URLSearchParams(this.#location.search);

    const unvalidatedZones = queryParams.getAll(ImportExportService.queryParamZone) as ITimeZoneName[];
    const validatedZones = unvalidatedZones.filter((z) => allValidZones.has(z));

    if (unvalidatedZones.length !== validatedZones.length) {
      console.error('Query param included invalid zone(s)', unvalidatedZones.filter(v => !validatedZones.includes(v)));
    }

    return validatedZones;
  }
}
