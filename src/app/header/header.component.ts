import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { ZoneService } from '../zone-service/zone.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { defer, map, startWith } from 'rxjs';
import { IconButtonComponent } from '../buttons/icon-button/icon-button.component';
import { ModalService } from '../modal/modal.service';
import { ImportExportService } from '../import-export-service/import-export.service';
import { TimeHighlightService } from '../time-highlight-modal/time-highlight.service';

@Component({
  selector: 'header[wtiii-header]',
  imports: [
    ReactiveFormsModule,
    IconButtonComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly #timHighlightService = inject(TimeHighlightService);
  readonly #importExportService = inject(ImportExportService);
  readonly #zoneService = inject(ZoneService);
  readonly #modalService = inject(ModalService);
  readonly #injector = inject(EnvironmentInjector);

  protected readonly form = new FormGroup({
    date: new FormControl(this.#toDateTimeLocalString(this.#zoneService.renderDate()), {
      validators: [Validators.required],
    }),
  });
  readonly #dateControlChanged = toSignal(this.form.controls.date.valueChanges.pipe(startWith(this.form.controls.date.value)));

  openMap() {
    this.#modalService.open$(
      defer(() => import('../map/map.component')).pipe(map(m => m.MapComponent)),
      this.#injector,
      {},
    ).subscribe();
  }

  openTimeHighlighter() {
    this.#modalService.open$(
      defer(() => import('../time-highlight-modal/time-highlight-modal.component')).pipe(map(m => m.TimeHighlightModalComponent)),
      this.#injector,
      {},
    ).subscribe();
  }

  resetDate() {
    this.#zoneService.renderDate.set(new Date());
  }

  async copy() {
    const zones = this.#zoneService.getSelectedZonesForUrl();
    const highlights = this.#timHighlightService.getHighlightsForUrl();

    const url = this.#importExportService.updatePageUrlWithZones(
      zones,
      highlights,
    );

    if (url) {
      await this.#importExportService.copyUrlToClipboard(url);
    }
  }

  readonly #fx = {
    dateFormChangeEffect: effect(() => {
      const dateString = this.#dateControlChanged();

      const date = dateString ? new Date(dateString) : null;

      if (!date) {
        return;
      }

      this.#zoneService.renderDate.set(date);
    }),

    globalDateChangeEffect: effect(() => {
      const globalDate = this.#zoneService.renderDate();

      const globalDateString = this.#toDateTimeLocalString(globalDate);

      if (globalDateString === this.form.controls.date.value) {
        return;
      }
      this.form.controls.date.setValue(globalDateString);
    }),
  };

  /**
   * Convert a JS Date to a local ISO time, i.e. `yyyy-MM-ddTHH:mm:ss.fff` with NO timezone suffix.
   * Unfortunately I know of no better mechanism for this without different tooling.
   *
   * @returns a local ISO time or null for invalid dates.
   *
   * @private
   *
   * @summary
   * I...
   *  1. truly hate JS Date
   *  2. cannot wait for Temporal 🙏📅
   *  3. would use Luxon if this weren't the only place I needed to do basically any date manipulation
   */
  #toDateTimeLocalString(d: Date) {
    if (+d) {
      const year = d.getFullYear();

      return `${
        this.#numpad(year, year > 9999 ? 6 : 4)
      }-${
        this.#numpad((d.getMonth() + 1))
      }-${
        this.#numpad(d.getDate())
      }T${
        this.#numpad(d.getHours())
      }:${
        this.#numpad(d.getMinutes())
      }:${
        this.#numpad(d.getSeconds())
      }.${
        this.#numpad(d.getMilliseconds(), 3)
      }`;
    }
    return null;
  }

  #numpad(num: number, padTo = 2) {
    return num.toString().padStart(padTo, '0');
  }
}
