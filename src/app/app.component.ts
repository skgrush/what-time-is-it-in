import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ZoneColumnComponent } from './zone-column/zone-column.component';
import { ZoneService } from './zone-service/zone.service';
import { ZonePickerOptionsComponent } from './zone-picker/zone-picker-options/zone-picker-options.component';
import { AddZoneColumnComponent } from './zone-column/add-zone-column/add-zone-column.component';
import { HeaderComponent } from './header/header.component';
import { MapOpenerService } from './map/map-opener.service';
import { MapDialogComponent } from './map/map-dialog/map-dialog.component';

@Component({
  selector: 'wtiii-root',
  imports: [
    ZoneColumnComponent,
    ZonePickerOptionsComponent,
    AddZoneColumnComponent,
    HeaderComponent,
    MapDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly #zoneService = inject(ZoneService);

  readonly mapOpenerService = inject(MapOpenerService);

  readonly selectedZones = this.#zoneService.selectedZonesInfo;
}
