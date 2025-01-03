import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
} from '@angular/core';
import { ZonePickerComponent } from '../zone-picker/zone-picker.component';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { ZoneService } from '../zone-service/zone.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ColumnIdType } from '../types/zone-info';
import { INTL_LOCALE } from '../tokens/intl-locale';
import { JsonPipe } from '@angular/common';
import { map, skip } from 'rxjs';
import { VerticalClockComponent } from '../vertical-clock/vertical-clock.component';
import { IconButtonComponent } from '../buttons/icon-button/icon-button.component';

@Component({
  selector: 'wtiii-zone-column',
  imports: [
    ZonePickerComponent,
    JsonPipe,
    VerticalClockComponent,
    IconButtonComponent,
  ],
  templateUrl: './zone-column.component.html',
  styleUrl: './zone-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': "'zone-column-' + columnId()"
  },
})
export class ZoneColumnComponent {

  readonly #zoneService = inject(ZoneService);
  readonly #intlLocale = inject(INTL_LOCALE);

  public timeZoneValidator: ValidatorFn = (control: AbstractControl<ITimeZoneName | null>) => {
    if (control.value && !this.#zoneService.allZones.has(control.value)) {
      return {
        'invalidTimeZone': true,
      };
    }

    return null;
  }

  public readonly columnId = input.required<ColumnIdType>();

  protected readonly zonePickerOptionsId = this.#zoneService.zonePickerOptionsId;

  protected readonly zoneFormControl = new FormControl<ITimeZoneName | null>(null, {
    validators: [this.timeZoneValidator],
  });
  readonly #zoneFormControlValueChangedValid = toSignal(this.zoneFormControl.valueChanges.pipe(
    skip(1),
    map(value => {
      if (this.zoneFormControl.valid && !!value) {
        return value;
      }
      return null;
    })
  ));

  protected readonly selectedZone = computed(() => {
    const id = this.columnId();
    const selectedZonesInfo = this.#zoneService.selectedZonesInfo();

    return selectedZonesInfo.get(id);
  });

  readonly #timeZoneNameFormatter = computed(() => {
    const locale = this.#intlLocale;
    const selectedZone = this.selectedZone();
    if (!selectedZone) return;

    return new Intl.DateTimeFormat(locale, { timeZone: selectedZone.timeZoneName, timeZoneName: 'long' });
  });
  readonly #timeZoneOffsetFormatter = computed(() => {
    const locale = this.#intlLocale;
    const selectedZone = this.selectedZone();
    if (!selectedZone) return;

    return new Intl.DateTimeFormat(locale, { timeZone: selectedZone.timeZoneName, timeZoneName: 'longOffset' });
  });
  readonly #twentyFourHourFormatter = computed(() => {
    const locale = this.#intlLocale;
    const selectedZone = this.selectedZone();
    if (!selectedZone) return;

    return new Intl.DateTimeFormat(locale, { timeZone: selectedZone.timeZoneName, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
  });

  protected readonly time = computed(() => {
    const date = this.#zoneService.renderDate();
    const formatter = this.#twentyFourHourFormatter();

    return formatter?.format(date)
  })
  protected readonly timeParts = computed(() => {
    const date = this.#zoneService.renderDate();
    const formatter = this.#twentyFourHourFormatter();

    if (!formatter) {
      return;
    }

    const partsWeCareAbout = formatter.formatToParts(date);

    const hour = Number(partsWeCareAbout.find(p => p.type === 'hour')?.value);
    const minute = Number(partsWeCareAbout.find(p => p.type === 'minute')?.value);
    const second = Number(partsWeCareAbout.find(p => p.type === 'second')?.value);

    if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
      return;
    }

    return [hour, minute, second] as const;
  });
  protected readonly timeInSeconds = computed(() => {
    const timeParts = this.timeParts();

    if (!timeParts) {
      return;
    }

    return timeParts.toReversed().reduce((total, currentPart, currentIdx) => total + currentPart * 60**currentIdx, 0);
  });
  protected readonly offset: Signal<string | undefined> = computed(() => {
    const date = this.#zoneService.renderDate();
    const formatter = this.#timeZoneOffsetFormatter();

    return formatter?.formatToParts(date)
      .find(p => p.type === 'timeZoneName')?.value;
  });
  protected readonly timeZoneName: Signal<string | undefined> = computed(() => {
    const date = this.#zoneService.renderDate();
    const formatter = this.#timeZoneNameFormatter();

    return formatter?.formatToParts(date)
      .find(p => p.type === 'timeZoneName')?.value;
  });

  protected readonly canDelete = computed(() => {
    // const id = this.columnId();
    const selectedZones = this.#zoneService.selectedZonesInfo();

    return selectedZones.size > 1;
  });

  readonly #columnIdEffect = effect(() => {
    const id = this.columnId();

    // check if this column already has a value stored
    const stored = this.#zoneService.selectedZonesInfo().get(id);

    if (!stored) {
      return;
    }

    this.zoneFormControl.reset(stored.timeZoneName);
  });

  readonly #effect = effect(() => {
    const id = this.columnId();
    const formControlValue = this.#zoneFormControlValueChangedValid();

    if (formControlValue === undefined) {
      return;
    }

    this.#zoneService.changeZoneInfo(id, formControlValue ?? null);
  });

  delete() {
    if (!this.canDelete()) {
      return;
    }

    this.#zoneService.deleteZoneInfo(this.columnId());
  }
}
