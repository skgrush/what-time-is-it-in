import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { ITimeZoneName, RegionZoneMapping } from '../types/region-zone-mapping';

@Component({
  selector: 'wtiii-zone-picker',
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
  ],
  templateUrl: './zone-picker.component.html',
  styleUrl: './zone-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonePickerComponent {

  public readonly id = input.required<string>();
  public readonly zoneFormControl = input.required<FormControl<ITimeZoneName | null>>();
  public readonly allZones = input.required<RegionZoneMapping>();

}
