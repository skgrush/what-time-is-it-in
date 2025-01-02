import { Component, input } from '@angular/core';
import { ZonePickerComponent } from '../zone-picker/zone-picker.component';

@Component({
  selector: 'wtiii-zone-column',
  imports: [
    ZonePickerComponent,
  ],
  templateUrl: './zone-column.component.html',
  styleUrl: './zone-column.component.scss'
})
export class ZoneColumnComponent {

  readonly id = input.required<string>();
}
