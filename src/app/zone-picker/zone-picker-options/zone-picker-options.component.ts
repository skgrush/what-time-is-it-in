import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ZoneService } from '../../zone-service/zone.service';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'datalist[wtiii-zone-picker-options]',
  imports: [
    KeyValuePipe,
  ],
  templateUrl: './zone-picker-options.component.html',
  styleUrl: './zone-picker-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': "zonePickerOptionsId"
  }

})
export class ZonePickerOptionsComponent {
  readonly #zoneService = inject(ZoneService);
  protected readonly allZones = this.#zoneService.allZonesByRegion;
  protected readonly zonePickerOptionsId = this.#zoneService.zonePickerOptionsId;
}
