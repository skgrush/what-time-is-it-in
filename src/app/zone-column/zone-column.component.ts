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
import { FormControl } from '@angular/forms';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { ZoneService } from '../zone-service/zone.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ColumnIdType } from '../types/zone-info';
import { INTL_LOCALE } from '../tokens/intl-locale';
import { JsonPipe } from '@angular/common';
import { distinctUntilChanged } from 'rxjs';
import { VerticalClockComponent } from '../vertical-clock/vertical-clock.component';

@Component({
  selector: 'wtiii-zone-column',
  imports: [
    ZonePickerComponent,
    JsonPipe,
    VerticalClockComponent,
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

  public readonly columnId = input.required<ColumnIdType>();

  protected readonly zoneFormControl = new FormControl<ITimeZoneName | null>(null);
  readonly #zoneFormControlValueChanged = toSignal(this.zoneFormControl.valueChanges.pipe(distinctUntilChanged()));

  protected readonly allZones = this.#zoneService.allZonesByRegion;

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
    const id = this.columnId();
    const initialId = this.#zoneService.initialId;


    return id !== initialId;
  });

  readonly #effect = effect(() => {
    const id = this.columnId();
    const formControlChanged = this.#zoneFormControlValueChanged();

    this.#zoneService.changeZoneInfo(id, formControlChanged ?? null);
  });

  delete() {
    if (!this.canDelete()) {
      return;
    }

    this.#zoneService.deleteZoneInfo(this.columnId());
  }
}
