import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITimeHighlight } from '../time-highlight-modal/time-highlight';
import { ClockHighlightComponent } from './clock-highlight/clock-highlight.component';
import { hourHeightPx, hoursOffset, maxHour, minHour } from '../time-highlight-modal/time-utils';

const hourTicks = Object.freeze(Array(maxHour - minHour).fill(0).map((_, i) => i + minHour));

@Component({
  selector: 'wtiii-vertical-clock',
  imports: [
    ClockHighlightComponent,
  ],
  templateUrl: './vertical-clock.component.html',
  styleUrl: './vertical-clock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // the height of an hour in PX
    'tabindex': '0',
    '[style.--hour-height-px.px]': 'hourHeightPx',
    // the offset for minimum hours in PX, i.e. -14 hours
    '[style.--min-hour-px.px]': 'minHour * hourHeightPx',
    '[style.--local-seconds-offset.px]': '((seconds() / -3600) * hourHeightPx)',
    '[style.--hours-offset-px.px]': 'hoursOffset * hourHeightPx',
    '(keydown.arrowDown)': 'scrolled.emit({ hours: 1 })',
    '(keydown.arrowUp)': 'scrolled.emit({ hours: -1 })',
    '(wheel)': 'wheel($event)',
  }
})
export class VerticalClockComponent {
  protected readonly hoursOffset = hoursOffset;
  protected readonly hourTicks = hourTicks;
  protected readonly minHour = minHour;
  protected readonly hourHeightPx = hourHeightPx;
  protected readonly clockHeight = hourHeightPx * (maxHour - minHour);

  public readonly seconds = input.required<number>();
  public readonly highlights = input.required<readonly ITimeHighlight[]>();

  public readonly scrolled = output<{ hours: number }>();

  readonly #pixelsToTriggerScroll = 8;
  #scrollPxs = 0;

  protected wheel(e: WheelEvent) {
    console.info('scroll wheel', e.deltaMode, e.deltaY);
    switch (e.deltaMode) {
      case WheelEvent.DOM_DELTA_PIXEL: {
        this.#scrollPxs += e.deltaY;
        if (Math.abs(this.#scrollPxs) > this.#pixelsToTriggerScroll) {
          const scrollCount = (this.#scrollPxs / this.#pixelsToTriggerScroll) | 0;
          this.#scrollPxs %= 1;
          this.scrolled.emit({ hours: scrollCount });
        }

        break;
      }
      case WheelEvent.DOM_DELTA_LINE:
      case WheelEvent.DOM_DELTA_PAGE:
      {
        this.scrolled.emit({ hours: -e.deltaY });
        break;
      }
    }
  }
}
