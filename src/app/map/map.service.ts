import { Injectable } from '@angular/core';
import { defer, map, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TzDbTabFile } from './tz-db-tab';
import { ICoordinate } from './ICoordinate';


@Injectable({
  providedIn: 'root'
})
export class MapService {

  readonly zone1970data$ = defer(() =>
    import('../data/zone1970.tab')
  ).pipe(
    map(module => TzDbTabFile.parseTabFile(module.default)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  getNearestTimeZone$(coords: ICoordinate) {
    return this.zone1970data$.pipe(
      map(tabFile => {
        return tabFile.binarySearchNearest(coords);
      }),
    );
  }

  mouseEventToLatLon(event: MouseEvent): undefined | ICoordinate {
    const { target, offsetX, offsetY } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const { offsetWidth, offsetHeight } = target;

    // latitude: South->North => -90ºS -> +90ºN ; 0º at equator
    const latitude = (
      offsetHeight / 2 - offsetY
    ) * (180 / offsetHeight);

    // longitude: West->East => -180ºW -> +180ºE ; 0º at Greenwich
    const longitude = (
      offsetX - offsetWidth / 2
    ) * (360 / offsetWidth);

    return {
      latitude,
      longitude,
    };
  }
}

