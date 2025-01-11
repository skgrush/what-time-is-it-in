import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
    '[style.--hour-height-px.px]': 'hourHeightPx',
    // the offset for minimum hours in PX, i.e. -14 hours
    '[style.--min-hour-px.px]': 'minHour * hourHeightPx',
    '[style.--local-seconds-offset.px]': '((seconds() / -3600) * hourHeightPx)',
    '[style.--hours-offset-px.px]': 'hoursOffset * hourHeightPx',
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
}
