import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ITimeHighlight } from '../time-highlight-modal/time-highlight';
import { ClockHighlightComponent } from './clock-highlight/clock-highlight.component';
import { hourHeightPx, hoursOffset, maxHour, minHour } from '../time-highlight-modal/time-utils';
import { ScrollHandler } from './scrollHandler';

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
    '(wheel)': 'scrollHandler.handleWheelEvent($event)',
    '(touchstart)': 'scrollHandler.handleTouchEvent($event)',
    '(touchcancel)': 'scrollHandler.handleTouchEvent($event)',
    '(touchend)': 'scrollHandler.handleTouchEvent($event)',
    '(touchmove)': 'scrollHandler.handleTouchEvent($event)',
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

  protected readonly scrollHandler = new ScrollHandler(
    hourHeightPx,
    scrollAmount => this.scrolled.emit({ hours: scrollAmount})
  );

}
