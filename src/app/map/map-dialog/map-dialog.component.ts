import { ChangeDetectionStrategy, Component, effect, ElementRef, inject } from '@angular/core';
import { MapComponent } from '../map.component';
import { MapOpenerService } from '../map-opener.service';

@Component({
  selector: 'dialog[wtiii-map-dialog]',
  imports: [
    MapComponent,
  ],
  templateUrl: './map-dialog.component.html',
  styleUrl: './map-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(close)': 'onClose()',
  }
})
export class MapDialogComponent {
  readonly #elementRef = inject(ElementRef<HTMLDialogElement>);
  readonly #mapOpenerService = inject(MapOpenerService);

  protected onClose() {
    this.#mapOpenerService.isOpen.set(false);
  }

  readonly #fx = {
    opener: effect(() => {
      const isOpen = this.#mapOpenerService.isOpen();
      const dialog: HTMLDialogElement = this.#elementRef.nativeElement;

      isOpen
        ? dialog.showModal()
        : dialog.close();
    }),

  };
}
