import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const hoursOffset = 6;
const hourHeightPx = 30;
const minHour = -14;
const maxHour = 24 + 14;
const hourTicks = Object.freeze(Array(maxHour - minHour).fill(0).map((_, i) => i + minHour));

@Component({
  selector: 'wtiii-vertical-clock',
  imports: [],
  templateUrl: './vertical-clock.component.html',
  styleUrl: './vertical-clock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--hour-height-px]': 'hourHeightPx + "px"',
    '[style.--top-offset-px]': '(-1 * (seconds() / 3600 - minHour) * hourHeightPx) + "px"',
    '[style.--hours-offset-px]': 'hoursOffset * hourHeightPx + "px"',
  }
})
export class VerticalClockComponent {
  protected readonly hoursOffset = hoursOffset;
  protected readonly hourTicks = hourTicks;
  protected readonly minHour = minHour;
  protected readonly hourHeightPx = hourHeightPx;

  public readonly seconds = input.required<number>();
}
