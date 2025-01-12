import { ChangeDetectionStrategy, Component, input, output, OutputEmitterRef } from '@angular/core';
import { ITimeHighlight } from '../time-highlight-modal/time-highlight';
import { ClockHighlightComponent } from './clock-highlight/clock-highlight.component';
import { hourHeightPx, hoursOffset, maxHour, minHour } from '../time-highlight-modal/time-utils';

const hourTicks = Object.freeze(Array(maxHour - minHour).fill(0).map((_, i) => i + minHour));

class TouchHandler {
  readonly #pixelsToTriggerScroll = hourHeightPx;

  #state?: {
    readonly id: number;
    readonly lastSetPositionY: number,
  };
  readonly #scrolled: OutputEmitterRef<{ hours: number }>;

  constructor(scrollOutput: OutputEmitterRef<{ hours: number }>) {
    this.#scrolled = scrollOutput;
  }

  handleTouchEvent(e: TouchEvent) {
    if (e.type === 'touchstart') {
      this.#start(e.changedTouches[0]);
      return;
    }

    const touch = this.#findTouch(e.changedTouches);
    if (!touch) {
      return;
    }

    switch (e.type) {
      case 'touchcancel': return this.#cancel(touch);
      case 'touchend': return this.#end(touch);
      case 'touchmove': return this.#move(touch);
    }
  }

  #findTouch(touchList: TouchList) {
    const id = this.#state?.id;
    if (id === undefined) {
      return undefined;
    }
    for (let i = 0; i < touchList.length; ++i) {
      const touch = touchList[i];
      if (touch.identifier === id) {
        return touch;
      }
    }
    return undefined;
  }

  #start(touch: Touch) {
    if (this.#state !== undefined) {
      // already looking at a different touchId
      return;
    }

    this.#state = {
      id: touch.identifier,
      lastSetPositionY: touch.clientY,
    };
  }

  #cancel(touch: Touch) {
    this.#state = undefined;
  }

  #end(touch: Touch) {
    this.#handleTouchChange(touch);
    this.#state = undefined;
  }

  #move(touch: Touch) {
    this.#handleTouchChange(touch);
  }

  #handleTouchChange(touch: Touch) {
    const state = this.#state!;

    const { clientY } = touch;
    const deltaPx = clientY - state.lastSetPositionY;

    if (Math.abs(deltaPx) < this.#pixelsToTriggerScroll) {
      console.info('touch NO change', touch.identifier, deltaPx);
      return;
    }
    console.info('touch change', touch.identifier, deltaPx);

    const scrollCount = (deltaPx / this.#pixelsToTriggerScroll) | 0;
    const newPixelPosition = state.lastSetPositionY + (scrollCount * this.#pixelsToTriggerScroll);

    this.#state = {
      ...state,
      lastSetPositionY: newPixelPosition,
    };
    this.#scrolled.emit({ hours: -scrollCount });
  }
}

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
    '(touchstart)': 'touchHandler.handleTouchEvent($event)',
    '(touchcancel)': 'touchHandler.handleTouchEvent($event)',
    '(touchend)': 'touchHandler.handleTouchEvent($event)',
    '(touchmove)': 'touchHandler.handleTouchEvent($event)',
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

  protected readonly touchHandler = new TouchHandler(this.scrolled);

  readonly #pixelsToTriggerScroll = hourHeightPx;
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
