import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ZonePickerComponent } from '../zone-picker/zone-picker.component';
import { FormControl } from '@angular/forms';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { ZoneService } from '../zone-service/zone.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IdType } from '../types/zone-info';

@Component({
  selector: 'wtiii-zone-column',
  imports: [
    ZonePickerComponent,
  ],
  templateUrl: './zone-column.component.html',
  styleUrl: './zone-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneColumnComponent implements OnInit {

  readonly #zoneService = inject(ZoneService);

  public readonly id = input.required<IdType>();

  protected readonly zoneFormControl = new FormControl<ITimeZoneName | null>(null);
  readonly #zoneFormControlValueChanged = toSignal(this.zoneFormControl.valueChanges);

  protected readonly allZones = this.#zoneService.allZonesByRegion;

  protected readonly selectedZone = computed(() => {
    // const valueChanged = this.#zoneFormControlValueChanged();
    const id = this.id();
    const selectedZonesInfo = this.#zoneService.selectedZonesInfo();


    return selectedZonesInfo.get(id);
  });

  protected readonly canDelete = computed(() => {
    const id = this.id();
    const initialId = this.#zoneService.initialId;


    return id !== initialId;
  });

  readonly #effect = effect(() => {
    const id = this.id();
    const formControlChanged = this.#zoneFormControlValueChanged();

    this.#zoneService.changeZoneInfo(id, formControlChanged ?? null);
  });

  ngOnInit() {

  }

  delete() {
    if (!this.canDelete()) {
      return;
    }

    this.#zoneService.deleteZoneInfo(this.id());
  }
}
