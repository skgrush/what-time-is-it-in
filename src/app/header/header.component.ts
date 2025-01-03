import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ZoneService } from '../zone-service/zone.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { CopyButtonComponent } from '../buttons/copy-button/copy-button.component';

@Component({
  selector: 'header[wtiii-header]',
  imports: [
    ReactiveFormsModule,
    CopyButtonComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly #zoneService = inject(ZoneService);

  protected readonly form = new FormGroup({
    date: new FormControl(this.#toDateTimeLocalString(this.#zoneService.renderDate()), {
      validators: [Validators.required],
    }),
  });
  readonly #dateControlChanged = toSignal(this.form.controls.date.valueChanges.pipe(startWith(this.form.controls.date.value)));

  resetDate() {
    this.#zoneService.renderDate.set(new Date());
  }

  copy() {
    void this.#zoneService.copy();
  }

  readonly #dateFormChangeEffect = effect(() => {
    const dateString = this.#dateControlChanged();

    const date = dateString ? new Date(dateString) : null;

    if (!date) {
      return;
    }

    this.#zoneService.renderDate.set(date);
  });

  readonly #globalDateChangeEffect = effect(() => {
    const globalDate = this.#zoneService.renderDate();

    const globalDateString = this.#toDateTimeLocalString(globalDate);

    if (globalDateString === this.form.controls.date.value) {
      return;
    }
    this.form.controls.date.setValue(globalDateString);
  });

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
