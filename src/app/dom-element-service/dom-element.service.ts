import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DomElementService {

  readonly #document = inject(DOCUMENT);

  createSVGElement<TName extends keyof SVGElementTagNameMap>(tagName: TName) {
    return this.#document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }
}
