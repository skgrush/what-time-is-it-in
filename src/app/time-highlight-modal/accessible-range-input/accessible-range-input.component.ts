import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { startWith, switchMap } from 'rxjs';
import { TimeHighlightModalResizeService } from '../time-highlight-modal-resize.service';
import { decimalHoursToTime, timeStringToDecimalHours } from '../time-utils';

@Component({
  selector: 'wtiii-accessible-range-input',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './accessible-range-input.component.html',
  styleUrl: './accessible-range-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onClick($event)',
    '(touchstart)': 'onClick($event)',
  }
})
export class AccessibleRangeInputComponent {
  readonly resizeService = inject(TimeHighlightModalResizeService);

  readonly timeInput = viewChild.required<ElementRef<HTMLInputElement>>('timeInput');

  readonly control = input.required<FormControl<number>>();

  readonly type = signal<'range' | 'time'>('range');

  readonly formControlValue = toSignal(
    toObservable(this.control).pipe(
      switchMap(control =>
        control.valueChanges.pipe(
          startWith(control.value),
        ),
      ),
    ),
  );

  readonly formControlAsDate = computed(() => {
    const formControlValue = this.formControlValue()!;
    return decimalHoursToTime(formControlValue).padStart(5, '0');
  })

  protected onClick(e: Event) {
    if (this.#switchToTimeIfAppropriate()) {
      e.preventDefault();
    }
  }

  protected onChangeTime(e: Event) {
    console.debug('changeTime', e);
    const { target } = e;
    if (!(target && target instanceof HTMLInputElement)) {
      return;
    }
    const { value } = target;

    const normalizedValue =
      value.length > 5
        ? value.slice(0, -3)
        : value;

    this.control().setValue(timeStringToDecimalHours(normalizedValue));
  }

  #switchToTimeIfAppropriate() {
    if (this.resizeService.modalSizeBoundary() === 'small' && this.type() !== 'time') {
      this.type.set('time');
      setTimeout(() => {
        this.timeInput().nativeElement.focus();
      });
      return true;
    }
    return false;
  }

  protected onFocusRange(e: FocusEvent) {
    this.#switchToTimeIfAppropriate();
  }
  protected onBlurTime(e: FocusEvent) {
    this.type.set('range');
  }

  readonly #fx = {
    typeChange: effect(() => {
      // const type = this.type();
      // const timeInput = this.timeInput();
      //
      // if (type === 'time') {
      //   timeInput.nativeElement.focus();
      // }
    })
  }
}
