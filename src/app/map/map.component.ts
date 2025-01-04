import { Component, computed, signal } from '@angular/core';

type ICoords = {
  readonly latitude: number;
  readonly longitude: number;
}

@Component({
  selector: 'wtiii-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {

  protected mouseCoords = signal<ICoords | undefined>(undefined);
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

    const coords = this.#mouseEventToLatLon(e);
    if (!coords) {
      return;
    }


  }

  protected onMouseMove(e: MouseEvent) {
    const coords = this.#mouseEventToLatLon(e);
    this.mouseCoords.set(coords);
  }

  #mouseEventToLatLon(event: MouseEvent): undefined | ICoords {
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
