import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ITimeHighlight } from '../../time-highlight-modal/time-highlight';
import {
  hourHeightPx,
  maxHour,
  minHour,
  startAndEndToOrderedPair,
  timeHighlightToPeriodString,
} from '../../time-highlight-modal/time-utils';

@Component({
  selector: 'wtiii-clock-highlight',
  imports: [],
  templateUrl: 'clock-highlight.component.html',
  styleUrl: './clock-highlight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--start-in-px.px]': 'highlight().start * hourHeightPx',
    '[style.--end-in-px.px]': '(highlight().end > highlight().start ? highlight().end : highlight().end + 24) * hourHeightPx',
    '[style.--highlight-color]': 'highlight().hex',
    '[attr.data-highlight]': 'json()',
  }
})
export class ClockHighlightComponent {
  readonly highlight = input.required<ITimeHighlight>();
  readonly hourHeightPx = hourHeightPx;

  readonly json = computed(() => JSON.stringify(this.highlight()));

  readonly individualRenders = computed(() => {
    const highlight = this.highlight();


    const [canonStart, canonEnd] = startAndEndToOrderedPair(highlight.start, highlight.end);
    const title = timeHighlightToPeriodString({ start: canonStart, end: canonEnd });

    return [...function*() {
      if (canonEnd - 24 > minHour) {
        const start = Math.max(minHour, canonStart - 24);
        const end = canonEnd - 24;

        yield {
          i: -1,
          start,
          end,
          title,
        };
      }

      yield {
        i: 0,
        start: canonStart,
        end: canonEnd,
        title,
      };

      if (canonStart + 24 < maxHour) {
        const start = canonStart + 24;
        const end = Math.min(maxHour, canonEnd - 24);
        yield {
          i: 1,
          start,
          end,
          title,
        }
      }
    }()]
  });
}
