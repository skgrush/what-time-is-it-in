import { Component, computed, inject, signal } from '@angular/core';
import { MapService } from './map.service';
import { ICoordinate } from './ICoordinate';


@Component({
  selector: 'wtiii-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  readonly #mapService = inject(MapService);

  protected mouseCoords = signal<ICoordinate | undefined>(undefined);
  protected mouseCoordsText = computed(() => {
    const coords = this.mouseCoords();

    if (!coords) {
      return undefined;
    }
    return `${
      coords.latitude.toFixed(3).padStart(7, ' ')
    }º${ coords.latitude < 0 ? 'S' : 'N' } ${
      coords.longitude.toFixed(3).padStart(8, ' ')
    }º${ coords.longitude < 0 ? 'W' : 'E' }`;
  })

  protected onClick(e: MouseEvent) {
    console.log('clicked map', e);

    const coords = this.#mapService.mouseEventToLatLon(e);
    if (!coords) {
      return;
    }

    this.#mapService.getNearestTimeZone$(coords).subscribe(closest => {
      console.info('closest', closest);
    });
  }

  protected onMouseMove(e: MouseEvent) {
    const coords = this.#mapService.mouseEventToLatLon(e);
    this.mouseCoords.set(coords);
  }
}
