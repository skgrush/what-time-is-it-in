import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ZoneColumnComponent } from './zone-column/zone-column.component';
import { ZoneService } from './zone-service/zone.service';
import { ZonePickerOptionsComponent } from './zone-picker/zone-picker-options/zone-picker-options.component';

@Component({
  selector: 'wtiii-root',
  imports: [ZoneColumnComponent, ZonePickerOptionsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly #zoneService = inject(ZoneService);

  readonly selectedZones = this.#zoneService.selectedZonesInfo;

  add() {
    const newZoneId = this.#zoneService.addZone();
  }
}
