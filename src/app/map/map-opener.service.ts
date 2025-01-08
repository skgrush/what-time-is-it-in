import { EnvironmentInjector, inject, Injectable } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { defer, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapOpenerService {

  readonly #modalService = inject(ModalService);
  readonly #injector = inject(EnvironmentInjector);

  openMap$() {
    return this.#modalService.open$(
      defer(() => import('./map.component')).pipe(map(m => m.MapComponent)),
      this.#injector,
      {},
    );
  }
}
