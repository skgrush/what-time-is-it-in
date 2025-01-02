import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AddButtonComponent } from '../../buttons/add-button/add-button.component';
import { ZoneService } from '../../zone-service/zone.service';

@Component({
  selector: 'wtiii-add-zone-column',
  imports: [
    AddButtonComponent,
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
