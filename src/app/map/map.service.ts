import { Injectable } from '@angular/core';
import { defer, map, Observable, of, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TzDbTabFile } from './tz-db-tab';
import { ICoordinate } from './ICoordinate';
import { fromFetch } from 'rxjs/internal/observable/dom/fetch';
import { GeoJsonTimezoneBoundaryBuilder, TimeZoneBoundaryFeature } from './geo-json-timezone-boundary-builder';


@Injectable({
  providedIn: 'root'
})
export class MapService {

  readonly #zoneNowData$ = defer(() =>
    import('../data/zonenow.tzdata2024b.tab')
  ).pipe(
    map(module => TzDbTabFile.parseTabFile(module.default)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  /**
   *
   * @private
   * @link https://github.com/evansiroky/timezone-boundary-builder/releases/tag/2024b
   */
  readonly #timeZonesNowBoundaryBuilder$ = defer(() =>
    fromFetch('/assets/data/timezones-now.evansiroky.timezone-boundary-builder.2024b.geojson', { selector: response => response.json() }),
  ).pipe(
    map(jsonObject => GeoJsonTimezoneBoundaryBuilder.parseFileToFeatures(jsonObject)),
    map(features => new GeoJsonTimezoneBoundaryBuilder([...features])),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeZoneBuilderFeatures$ = this.#timeZonesNowBoundaryBuilder$.pipe(
    map(builder => builder.features),
  );

  getContainingTimeZone$(coord: ICoordinate): Observable<TimeZoneBoundaryFeature | null> {
    return this.#timeZonesNowBoundaryBuilder$.pipe(
      map(builder => builder.getContainingFeature(coord)),
    )
  }

  getNearestTimeZone$(coords: ICoordinate): Observable<ReturnType<TzDbTabFile['binarySearchNearest']>>;
  getNearestTimeZone$(coords?: ICoordinate): Observable<undefined | ReturnType<TzDbTabFile['binarySearchNearest']>>;
  getNearestTimeZone$(coords?: ICoordinate) {
    if (!coords) {
      return of(undefined);
    }
    return this.#zoneNowData$.pipe(
      map(tabFile => {
        return tabFile.binarySearchNearest(coords);
      }),
    );
  }

  mouseEventToLatLon(event: MouseEvent): undefined | ICoordinate {
    const { target, offsetX, offsetY } = event;
    let offsetWidth: number,
        offsetHeight: number;

    if (target instanceof HTMLElement) {
      ({offsetHeight, offsetWidth} = target);
    } else if (target instanceof SVGSVGElement) {
      ({clientHeight: offsetHeight, clientWidth: offsetWidth} = target);
    } else if (target instanceof SVGElement) {
      ({clientHeight: offsetHeight, clientWidth: offsetWidth} = target.viewportElement!);
    } else {
      debugger;
      return undefined;
    }

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

