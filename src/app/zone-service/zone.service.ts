import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ITimeZoneName, RegionZoneMapping } from '../types/region-zone-mapping';
import { ColumnIdType, IZoneInfo } from '../types/zone-info';
import { ImportExportService } from '../import-export-service/import-export.service';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  readonly #importExportService = inject(ImportExportService);
  readonly #isServerSide = isPlatformServer(inject(PLATFORM_ID));

  #currentIdNumber = 0;

  readonly myIanaTimezone = (
    this.#isServerSide
      ? 'Etc/UTC'
      : Intl.DateTimeFormat().resolvedOptions().timeZone
  ) as ITimeZoneName;

  readonly renderDate = signal(new Date(), {
    equal: (a, b) => +a === +b,
  });

  public readonly zonePickerOptionsId = 'zone-picker-options';

  public readonly allZones = (
    this.#isServerSide
    ? new Set(['Etc/UTC'])
    : new Set(Intl.supportedValuesOf('timeZone')).add('Etc/UTC')
  )as ReadonlySet<ITimeZoneName>;

  // TODO: does this work to create a lazy signal? Maybe we will need an observable with a delay to improve initial-load
  public readonly allZonesByRegion = computed(() => {
    const timeZones = this.allZones;

    const grouped = Object.groupBy(timeZones, ZoneService.getRegionFromTimeZone)
    for (let k in grouped) {
      Object.freeze(grouped[k]);
    }
    return Object.freeze(grouped) as RegionZoneMapping;
  });

  readonly #selectedZonesInfo = signal(this.#selectedZonesInitializer());
  public selectedZonesInfo = this.#selectedZonesInfo.asReadonly();

  #selectedZonesInitializer(): ReadonlyMap<ColumnIdType, IZoneInfo | undefined> {
    const validatedZones = this.#importExportService.getValidZonesFromQueryParams(this.allZones);

    if (validatedZones.length === 0) {
      // fallback behavior, fill in the current timezone if none others exist
      validatedZones.push(this.myIanaTimezone);
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

  public async copy() {
    const zones = [...this.selectedZonesInfo().values()]
      .map(z => z?.timeZoneName)
      .filter(name => !!name);

    const url = this.#importExportService.updatePageUrlWithZones(
      zones
    );

    if (url) {
      await this.#importExportService.copyUrlToClipboard(url);
    }
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

  public changeZoneInfo(id: ColumnIdType, timeZoneName: ITimeZoneName | null) {
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
    // currently does not decrement id counter

    this.#selectedZonesInfo.update(existingMap => {
      const newMap = new Map(existingMap);

      if (newMap.size === 1 || !newMap.delete(id)) {
        return existingMap;
      }
      return newMap;
    });
  }

  public static getRegionFromTimeZone<TR extends string>(
    zone: `${TR}/${string}` | string & {}
  ): TR {
    return zone.split('/', 1)[0] as TR;
  }
}
