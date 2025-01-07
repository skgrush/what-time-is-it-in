import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ZoneColumnComponent } from './zone-column/zone-column.component';
import { ZoneService } from './zone-service/zone.service';
import { ZonePickerOptionsComponent } from './zone-picker/zone-picker-options/zone-picker-options.component';
import { AddZoneColumnComponent } from './zone-column/add-zone-column/add-zone-column.component';
import { HeaderComponent } from './header/header.component';
import { ModalService } from './modal/modal.service';
import { ModalComponent } from './modal/modal.component';

@Component({
  selector: 'wtiii-root',
  imports: [
    ZoneColumnComponent,
    ZonePickerOptionsComponent,
    AddZoneColumnComponent,
    HeaderComponent,
    // dynamically deferred
    ModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly #zoneService = inject(ZoneService);

  protected readonly modalService = inject(ModalService);

  readonly selectedZones = this.#zoneService.selectedZonesInfo;
}
