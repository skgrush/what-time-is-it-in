import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { ZoneService } from '../zone-service/zone.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'wtiii-zone-picker',
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
  ],
  templateUrl: './zone-picker.component.html',
  styleUrl: './zone-picker.component.scss'
})
export class ZonePickerComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #zoneService = inject(ZoneService);

  readonly id = input.required();

  protected readonly allZones = toSignal(this.#zoneService.allZonesByRegion$, { requireSync: true });

  protected readonly control = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.control.valueChanges.pipe(
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe()
  }
}
