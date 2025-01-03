import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ZoneService } from '../../zone-service/zone.service';
import { IconButtonComponent } from '../../buttons/icon-button/icon-button.component';

@Component({
  selector: 'wtiii-add-zone-column',
  imports: [
    IconButtonComponent,
  ],
  templateUrl: './add-zone-column.component.html',
  styleUrls: [
    './add-zone-column.component.scss',
    '../zone-column.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddZoneColumnComponent {

  readonly #zoneService = inject(ZoneService);

  protected onAdd(e: MouseEvent) {
    const newZoneId = this.#zoneService.addZone();
  }
}
