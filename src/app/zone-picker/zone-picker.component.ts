import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { ColumnIdType } from '../types/zone-info';

@Component({
  selector: 'wtiii-zone-picker',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './zone-picker.component.html',
  styleUrl: './zone-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': "'zone-picker-' + columnId()"
  }
})
export class ZonePickerComponent {

  public readonly columnId = input.required<ColumnIdType>();
  public readonly zoneFormControl = input.required<FormControl<ITimeZoneName | null>>();

  public readonly zonePickerOptionsId = input.required<string>();
}
