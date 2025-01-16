export class ScrollHandler {
  #touchState?: {
    readonly id: number;
    readonly lastSetPositionY: number,
  };

  #wheelScrollPxs = 0;

  constructor(
    public readonly pixelsToTriggerScroll: number,
    protected readonly scrolled: (scrollAmount: number) => void
  ) {
  }

  handleWheelEvent(e: WheelEvent) {
    switch (e.deltaMode) {
      case WheelEvent.DOM_DELTA_PIXEL: {
        this.#wheelScrollPxs += e.deltaY;
        if (Math.abs(this.#wheelScrollPxs) > this.pixelsToTriggerScroll) {
          const scrollCount = (this.#wheelScrollPxs / this.pixelsToTriggerScroll) | 0;
          this.#wheelScrollPxs %= 1;
          this.scrolled(scrollCount);
        }

        break;
      }
      case WheelEvent.DOM_DELTA_LINE:
      case WheelEvent.DOM_DELTA_PAGE:
      {
        this.scrolled(-e.deltaY);
        break;
      }
    }
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
    const id = this.#touchState?.id;
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
    if (this.#touchState !== undefined) {
      // already looking at a different touchId
      return;
    }

    this.#touchState = {
      id: touch.identifier,
      lastSetPositionY: touch.clientY,
    };
  }

  #cancel(touch: Touch) {
    this.#touchState = undefined;
  }

  #end(touch: Touch) {
    this.#handleTouchChange(touch);
    this.#touchState = undefined;
  }

  #move(touch: Touch) {
    this.#handleTouchChange(touch);
  }

  #handleTouchChange(touch: Touch) {
    const state = this.#touchState!;

    const { clientY } = touch;
    const deltaPx = clientY - state.lastSetPositionY;

    if (Math.abs(deltaPx) < this.pixelsToTriggerScroll) {
      return;
    }

    const scrollCount = (deltaPx / this.pixelsToTriggerScroll) | 0;
    const newPixelPosition = state.lastSetPositionY + (scrollCount * this.pixelsToTriggerScroll);

    this.#touchState = {
      ...state,
      lastSetPositionY: newPixelPosition,
    };
    this.scrolled(-scrollCount);
  }
}
