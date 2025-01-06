import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  Renderer2,
  viewChild,
} from '@angular/core';
import { TimeZoneBoundaryFeature } from '../geo-json-timezone-boundary-builder';
import { toObservable } from '@angular/core/rxjs-interop';
import { scan } from 'rxjs';
import { TimezoneSvgService } from './timezone-svg.service';
import { ITimeZoneName } from '../../types/region-zone-mapping';

@Component({
  selector: 'wtiii-timezone-mapping',
  imports: [],
  templateUrl: './timezone-mapping.component.html',
  styleUrl: './timezone-mapping.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimezoneMappingComponent implements OnInit, AfterViewInit {
  readonly #renderer = inject(Renderer2);
  readonly #svgService = inject(TimezoneSvgService);

  protected readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  public readonly name = 'timezone-mapping';

  readonly isLoading = output<void>();
  readonly loaded = output<void>();
  readonly clickedFeature = output<TimeZoneBoundaryFeature>();
  readonly mousedOverFeature = output<TimeZoneBoundaryFeature | null>();

  readonly features = input.required<readonly TimeZoneBoundaryFeature[]>();

  readonly #featureMap = computed(() => {
    const features = this.features();

    return new Map(features.map(f => [f.tzid, f]));
  })

  protected onClickSvg(e: MouseEvent) {
    console.debug('onClickSvg', e);
    const featureTzId = this.#getTzIdFromSvgMouse(e);
    if (featureTzId) {
      this.clickedFeature.emit(featureTzId);
    }
  }

  protected onMouseMoveSvg(e: MouseEvent) {
    const featureTzId = this.#getTzIdFromSvgMouse(e);
    if (featureTzId !== undefined) {
      this.mousedOverFeature.emit(featureTzId);
    }
  }

  #getTzIdFromSvgMouse(e: MouseEvent) {
    const { target } = e;
    if (!(target instanceof SVGElement)) {
      return undefined;
    }

    if (!target.matches('g#landmasses *')) {
      return null;
    }

    let g: SVGGElement;
    if (target.matches('g[timezone] > path')) {
      g = target.parentNode as SVGGElement;
    }
    else if (target.matches('g[timezone]')) {
      g = target as SVGGElement;
    }
    else {
      console.error('context', e, e.target);
      throw new Error('Found unexpected target in landmasses');
    }

    const tz = this.#featureMap().get(g.id as ITimeZoneName);
    if (!tz) {
      console.error('context', e, e.target);
      throw new Error(`Found unexpected timezone: ${tz}`);
    }
    return tz;
  }

  ngOnInit() {
    this.isLoading.emit();
  }

  ngAfterViewInit() {
    const svg = this.svg().nativeElement;
    this.#svgService.makeMapFromTimezones(this.#renderer, svg, this.features());
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
