import { Injectable } from '@angular/core';
import { defer, map, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TzDbTabLine } from './tz-db-tab-line';


@Injectable({
  providedIn: 'root'
})
export class MapService {

  readonly zone1970data$ = defer(() =>
    import('../data/zone1970.tab')
  ).pipe(
    map(module => TzDbTabLine.parseTabFile(module.default)),
    shareReplay(1),
    takeUntilDestroyed(),
  );


  handleClick(e: MouseEvent) {

  }
}

