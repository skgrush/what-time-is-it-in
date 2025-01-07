import { EnvironmentInjector, inject, Injectable } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { defer, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapOpenerService {

  readonly #modalService = inject(ModalService);
  readonly #injector = inject(EnvironmentInjector);

  openMap$() {
    return defer(() =>
      import('./map.component')
    ).pipe(
      switchMap(({ MapComponent }) =>
        this.#modalService.open$(
          MapComponent,
          this.#injector,
          {},
        ),
      ),
    );
  }
}
