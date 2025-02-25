import { computed, inject, Injectable, signal } from '@angular/core';
import { ITimeZoneName, RegionZoneMapping } from '../types/region-zone-mapping';
import { ColumnIdType, IZoneInfo } from '../types/zone-info';
import { ImportExportService } from '../import-export-service/import-export.service';
import { ZoneNormalizerService } from '../zone-normalizer-service/zone-normalizer.service';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  readonly #zoneNormalizer = inject(ZoneNormalizerService);
  readonly #importExportService = inject(ImportExportService);

  #currentIdNumber = 0;

  readonly myBrowserTimezone = this.#zoneNormalizer.getMyBrowserTimeZone();

  readonly renderDate = signal(this.#zoneNormalizer.initialDate, {
    equal: (a, b) => +a === +b,
  });

  public readonly zonePickerOptionsId = 'zone-picker-options';

  readonly #allBrowserZones = this.#zoneNormalizer.getAllBrowserZones();

  public readonly allZonesByRegion = computed(() => {
    const timeZones = this.#allBrowserZones;

    const grouped = Object.groupBy(timeZones, ZoneService.getRegionFromTimeZone)
    for (let k in grouped) {
      Object.freeze(grouped[k]);
    }
    return Object.freeze(grouped) as RegionZoneMapping;
  });

  readonly #selectedZonesInfo = signal(this.#selectedZonesInitializer());
  public selectedZonesInfo = this.#selectedZonesInfo.asReadonly();

  #selectedZonesInitializer(): ReadonlyMap<ColumnIdType, IZoneInfo | undefined> {
    const validatedZones = this.#importExportService.getValidZonesFromQueryParams();

    if (validatedZones.length === 0) {
      // fallback behavior, fill in the current timezone if none others exist
      validatedZones.push(this.myBrowserTimezone);
    }

    return new Map(
      validatedZones.map(timeZoneName => [
        this.#generateNextId(),
        {
          timeZoneName,
          timeZoneRegion: ZoneService.getRegionFromTimeZone(timeZoneName),
        },
      ]),
    );
  }

  #generateNextId(): ColumnIdType {
    return `zone-column-${++this.#currentIdNumber}` as const;
  }

  getSelectedZonesForUrl() {
    return [...this.selectedZonesInfo().values()]
      .map(z => z?.timeZoneName)
      .filter(name => !!name);
  }

  public addZone() {
    const newId = this.#generateNextId();
    this.#selectedZonesInfo.update(existingMap => {
      const newMap = new Map(existingMap);
      newMap.set(newId, undefined);
      return newMap;
    });

    return newId;
  }

  public changeZoneInfo(id: ColumnIdType, originalTimeZoneName: ITimeZoneName | null) {
    let timeZoneName: ITimeZoneName | null = null;
    if (originalTimeZoneName) {
      timeZoneName = this.#zoneNormalizer.normalize(originalTimeZoneName);
      if (timeZoneName === null) {
        throw new Error('invalid timeZone name');
      }
    }

    const timeZoneRegion = timeZoneName ? ZoneService.getRegionFromTimeZone(timeZoneName) : undefined;
    const entry = !timeZoneRegion || !timeZoneName
      ? undefined
      : {
        timeZoneName,
        timeZoneRegion,
      } satisfies IZoneInfo;

    this.#selectedZonesInfo.update(existingMap => {
      if ((existingMap.get(id)?.timeZoneName ?? null) === timeZoneName) {
        return existingMap;
      }

      const newMap = new Map(existingMap);

      newMap.set(id, entry);
      return newMap;
    });

    return id;
  }

  /**
   * Delete a zone entry out of the selected set.
   *
   * Fails if the entry is not in the map, or if it is the last entry in the map.
   */
  public deleteZoneInfo(id: ColumnIdType) {
    // currently does not decrement id counter, they're always unique

    this.#selectedZonesInfo.update(existingMap => {
      const newMap = new Map(existingMap);

      if (newMap.size === 1 || !newMap.delete(id)) {
        return existingMap;
      }
      return newMap;
    });
  }

  public static getRegionFromTimeZone(
    zone: ITimeZoneName | string & {}
  ): string {
    if (zone === 'UTC') {
      return 'Etc';
    }
    return zone.split('/', 1)[0];
  }
}
