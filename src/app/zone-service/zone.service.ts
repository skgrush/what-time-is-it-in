import { computed, Injectable, signal } from '@angular/core';
import { ITimeZoneName, RegionZoneMapping } from '../types/region-zone-mapping';
import { IdType, IZoneInfo } from '../types/zone-info';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  #currentIdNumber = 0;

  // TODO: does this work to create a lazy signal? Maybe we will need an observable with a delay to improve initial-load
  public readonly allZonesByRegion = computed(() => {
    const timeZones = Intl.supportedValuesOf('timeZone');

    const grouped = Object.groupBy(timeZones, timeZone => timeZone.split('/', 1)[0])
    for (let k in grouped) {
      Object.freeze(grouped[k]);
    }
    return Object.freeze(grouped) as RegionZoneMapping;
  });

  readonly #selectedZonesInfo = signal<ReadonlyMap<IdType, IZoneInfo | undefined>>(new Map());
  public selectedZonesInfo = this.#selectedZonesInfo.asReadonly();

  public readonly initialId = this.addZone();

  public addZone() {
    const newId = `zone-${++this.#currentIdNumber}` as const;
    this.#selectedZonesInfo.update(existingMap => {
      const newMap = new Map(existingMap);
      newMap.set(newId, undefined);
      return newMap;
    });

    return newId;
  }

  public changeZoneInfo(id: IdType, timeZoneName: ITimeZoneName | null) {
    const timeZoneRegion = timeZoneName?.split('/')[0];
    const entry = !timeZoneRegion
      ? undefined
      : {
        timeZoneName,
        timeZoneRegion,
      } satisfies IZoneInfo;

    this.#selectedZonesInfo.update(existingMap => {
      if (existingMap.get(id)?.timeZoneName ?? undefined === timeZoneName) {
        return existingMap;
      }

      const newMap = new Map(existingMap);

      newMap.set(id, entry);
      return newMap;
    });
  }

  /**
   * Delete a zone entry out of the selected set.
   *
   * Fails if the entry is not in the map, or if it is the last entry in the map.
   */
  public deleteZoneInfo(id: IdType) {
    // currently does not decrement id counter

    this.#selectedZonesInfo.update(existingMap => {
      const newMap = new Map(existingMap);

      if (newMap.size === 1 || !newMap.delete(id)) {
        return existingMap;
      }
      return newMap;
    });
  }
}
