import { Component, computed, inject, signal } from '@angular/core';
import { MapService } from './map.service';
import { ICoordinate } from './ICoordinate';
import { ZoneService } from '../zone-service/zone.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TimezoneMappingComponent } from './timezone-mapping/timezone-mapping.component';
import { AsyncPipe } from '@angular/common';
import { TimeZoneBoundaryFeature } from './geo-json-timezone-boundary-builder';

export type MapType = 'NearestPrincipal' | 'LocalTime';

@Component({
  selector: 'wtiii-map',
  imports: [
    ReactiveFormsModule,
    TimezoneMappingComponent,
    AsyncPipe,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  readonly #mapService = inject(MapService);
  readonly #zoneService = inject(ZoneService);

  // protected readonly mapTypeFieldset = viewChild<HTMLFieldSetElement>('mapTypeFieldset');

  protected readonly mapTypeControl = new FormControl<MapType>('LocalTime', { nonNullable: true});

  protected readonly mouseCoords = signal<ICoordinate | undefined>(undefined);
  protected readonly mouseCoordsText = computed(() => {
    const coords = this.mouseCoords();

    if (!coords) {
      return undefined;
    }
    return `${
      coords.latitude.toFixed(3).padStart(7, ' ')
    }º${ coords.latitude < 0 ? 'S' : 'N' } ${
      coords.longitude.toFixed(3).padStart(8, ' ')
    }º${ coords.longitude < 0 ? 'W' : 'E' }`;
  });

  protected readonly mouseNearestTimeZoneResult =
    toSignal(
      toObservable(this.mouseCoords).pipe(
        switchMap(mouseCoords => this.#mapService.getNearestTimeZone$(mouseCoords))
      )
    );

  protected readonly mousedOverLocalTimeZoneResult = signal<TimeZoneBoundaryFeature | null>(null);

  protected readonly timeZoneBuilderFeatures$ = this.#mapService.timeZoneBuilderFeatures$;

  protected clickedFeature(feature: TimeZoneBoundaryFeature) {
    const newColumnId = this.#zoneService.addZone();
    this.#zoneService.changeZoneInfo(newColumnId, feature.tzid);
  }

  protected onClick(e: MouseEvent) {
    console.log('clicked map', e);

    const coords = this.#mapService.mouseEventToLatLon(e);
    if (!coords) {
      return;
    }

    switch (this.mapTypeControl.value) {
      case 'NearestPrincipal':
        return void this.#mapService.getNearestTimeZone$(coords).subscribe(closest => {
          console.info('closest', closest);
          const newColumnId = this.#zoneService.addZone();
          this.#zoneService.changeZoneInfo(newColumnId, closest.closest.timeZone);
        });
      case 'LocalTime':
        return void this.#mapService.getContainingTimeZone$(coords).subscribe(containedBy => {
          console.info('containedBy', containedBy);
        });
    }


  }

  protected onMouseMove(e: MouseEvent) {
    const coords = this.#mapService.mouseEventToLatLon(e);
    this.mouseCoords.set(coords);
  }
}
