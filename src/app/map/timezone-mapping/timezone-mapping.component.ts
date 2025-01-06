import { AfterViewChecked, ChangeDetectionStrategy, Component, input, NO_ERRORS_SCHEMA, output } from '@angular/core';
import { GeoJsonTimezoneBoundaryBuilder, TimeZoneBoundaryFeature } from '../geo-json-timezone-boundary-builder';
import { toObservable } from '@angular/core/rxjs-interop';
import { scan } from 'rxjs';
import { ITimeZoneName } from '../../types/region-zone-mapping';

@Component({
  selector: 'wtiii-timezone-mapping',
  imports: [],
  templateUrl: './timezone-mapping.component.html',
  styleUrl: './timezone-mapping.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // '[name]': 'name',
    // 'viewBox': '0 0 360 180',
    // 'xmlns': 'http://www.w3.org/2000/svg',
    // 'transform': 'scale(1, -1)',
    // 'transform-origin': 'center',
  },
  schemas: [NO_ERRORS_SCHEMA],
})
export class TimezoneMappingComponent implements AfterViewChecked {
  public readonly name = 'timezone-mapping';

  readonly isLoading = output<void>();
  readonly loaded = output<void>();
  readonly clickedFeature = output<TimeZoneBoundaryFeature>();
  readonly mousedOverFeature = output<TimeZoneBoundaryFeature | undefined>();

  readonly features = input.required<readonly TimeZoneBoundaryFeature[]>();

  protected onClick(e: MouseEvent, who: TimeZoneBoundaryFeature) {
    this.clickedFeature.emit(who);
  }

  protected mouseEntered(e: MouseEvent, who?: TimeZoneBoundaryFeature) {
    this.mousedOverFeature.emit(who);
  }

  ngOnInit() {
    this.isLoading.emit();
  }

  ngAfterViewChecked() {
    this.loaded.emit();
  }

  readonly #fx = {
    builderChanged: toObservable(this.features).pipe(
      scan((prev, next) => {
        if (next && prev) {
          throw new Error('<wtiii-timezone-mapping> only supports changing once');
        }
        return undefined;
      }, void 0),
    ).subscribe(),
  }
}
