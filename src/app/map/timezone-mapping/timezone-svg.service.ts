import { inject, Injectable, Renderer2 } from '@angular/core';
import { TimeZoneBoundaryFeature } from '../geo-json-timezone-boundary-builder';
import { DomElementService } from '../../dom-element-service/dom-element.service';

@Injectable({
  providedIn: 'root'
})
export class TimezoneSvgService {

  readonly #domElementService = inject(DomElementService);

  makeMapFromTimezones(renderer: Renderer2, svgEle: SVGSVGElement, features: readonly TimeZoneBoundaryFeature[]) {

    // ocean
    const waterRectangle = this.#domElementService.createSVGElement('rect');
    this.#setAttributes(null, waterRectangle, {
      x: '-180',
      y: '-90',
      width: '360',
      height: '180',
    });

    const waterG = this.#domElementService.createSVGElement('g');
    renderer.setAttribute(waterG, 'id', 'water');
    renderer.setAttribute(waterG, 'fill', 'blue');
    renderer.appendChild(waterG, waterRectangle);

    const worldG = this.#domElementService.createSVGElement('g');
    this.#setAttributes(null, worldG, {
      'id': "world",
      'transform': "scale(1, -1)",
      'transform-origin': "center",
      'viewBox': '0 -90 360 180',
    });
    renderer.appendChild(worldG, waterG);

    const landG = this.#domElementService.createSVGElement('g');
    this.#setAttributes(null, landG, {
      id: "landmasses",
      fill: "green",
      'fill-opacity': ".9",
      stroke: "black",
      'stroke-width': "0.2",
    });
    renderer.appendChild(worldG, landG);

    for (const feature of features) {
      const path = this.#domElementService.createSVGElement('path');
      path.setAttributeNS(null, 'd', feature.geometry.getSvgPath());

      const featureG = this.#domElementService.createSVGElement('g');
      featureG.setAttributeNS(null, 'id', feature.tzid);
      featureG.setAttributeNS(null, 'timezone', 'true');

      featureG.appendChild(path);

      landG.appendChild(featureG);
    }

    // const svgEle = this.#domElementService.createSVGElement('svg');

    // this.#setAttributes(renderer, svgEle, {
    //   'xmlns': "http://www.w3.org/2000/svg",
    //   'viewBox': "-180 90 360 180",
    //   'width': "100%",
    //   'height': "100%",
    //   'preserveAspectRatio': "xMidYMid",
    // });

    svgEle.appendChild(worldG);
  }

  #setAttributes(ns: null, ele: SVGElement, attributes: Record<string, string>) {
    for (const [prop, value] of Object.entries(attributes)) {
      ele.setAttributeNS(ns, prop, value);
    }
  }
}
