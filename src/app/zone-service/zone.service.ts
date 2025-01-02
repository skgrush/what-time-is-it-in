import { Injectable } from '@angular/core';
import { defer, map, Observable, of, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  readonly allZonesByRegion$ = defer(() =>
    of(Intl.supportedValuesOf('timeZone'))
  ).pipe(
    map(timeZones => {
      const grouped = Object.groupBy(timeZones, timeZone => timeZone.split('/', 1)[0])
      for (let k in grouped) {
        Object.freeze(grouped[k]);
      }
      return Object.freeze(grouped) as Readonly<Record<string, ReadonlyArray<string>>>;
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );
}
