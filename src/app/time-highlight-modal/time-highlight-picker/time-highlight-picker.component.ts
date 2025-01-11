import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  decimalHoursToDuration,
  decimalHoursToTime,
  rangeValidator,
  startAndEndToDuration,
  timeValidator,
} from '../time-utils';
import { IconButtonComponent } from '../../buttons/icon-button/icon-button.component';
import { ITimeHighlight } from '../time-highlight';
import { pickAColorForRangeV1 } from '../highlight-color';



@Component({
  selector: 'wtiii-time-highlight-picker',
  imports: [
    ReactiveFormsModule,
    IconButtonComponent,
  ],
  templateUrl: './time-highlight-picker.component.html',
  styleUrl: './time-highlight-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id',
  }
})
export class TimeHighlightPickerComponent {

  readonly id = input.required<string>();

  readonly timeHighlight = input.required<ITimeHighlight | null>();
  readonly changed = output<ITimeHighlight>();
  readonly deleted = output<void>();

  protected readonly form = new FormGroup({
    id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    start: new FormControl(9.00, { nonNullable: true, validators: [Validators.required, timeValidator] }),
    end: new FormControl(17.00, { nonNullable: true, validators: [Validators.required, timeValidator] }),
  }, {
    validators: [rangeValidator],
  });
  readonly #statusChanges = toSignal(this.form.statusChanges);
  readonly #valueChanges = toSignal(this.form.valueChanges);
  readonly #startValueChanges = toSignal(this.form.controls.start.valueChanges);
  readonly #endValueChanges = toSignal(this.form.controls.end.valueChanges);

  protected readonly invalidBecause = computed(() => {
    this.#statusChanges();

    if (this.form.valid) {
      return null;
    }
    if (this.form.errors?.['invalidDuration']) {
      return `Invalid duration ${this.form.errors['invalidDuration']}, must be between 0 and 24 hours`;
    }
    for (const controlName of ['start', 'end'] as const) {
      const control = this.form.controls[controlName];
      if (control.errors?.['invalidTime']) {
        return `Invalid ${controlName} time`;
      }
      if (control.errors?.['required']) {
        return `${controlName} required`;
      }
    }

    return null;
  });

  protected readonly canSubmit = computed(() => {
    this.#statusChanges();
    this.#valueChanges();

    return this.form.enabled && this.form.valid && this.form.dirty;
  });

  protected readonly canDelete = computed(() => {
    return this.timeHighlight() !== null;
  });

  protected readonly startValueString = computed(() => {
    const startValue = this.#startValueChanges() ?? this.form.controls.start.value;
    return decimalHoursToTime(startValue);
  });

  protected readonly endValueString = computed(() => {
    const endValue = this.#endValueChanges() ?? this.form.controls.end.value;
    return decimalHoursToTime(endValue);
  });

  protected readonly duration = computed(() => {
    const startValue = this.#startValueChanges() ?? this.form.controls.start.value;
    const endValue = this.#endValueChanges() ?? this.form.controls.end.value;

    const durationDecimalHours = startAndEndToDuration(startValue, endValue);
    return {
      durationString: decimalHoursToTime(durationDecimalHours),
      isoDuration: decimalHoursToDuration(durationDecimalHours),
    }
  });

  submit() {
    if (!this.canSubmit()) {
      this.form.markAsTouched();
      return;
    }

    const {
      id,
      start,
      end,
    } = this.form.getRawValue();

    this.changed.emit({
      id,
      start,
      end,
      hex: pickAColorForRangeV1(start, end),
    });
  }

  delete() {
    if (!this.canDelete()) {
      return;
    }

    this.deleted.emit();
  }

  readonly #fx = {
    change: effect(() => {
      const id = this.id();
      const timeHighlight = this.timeHighlight();
      if (!timeHighlight) {
        this.form.reset({
          id,
        });
        this.form.markAsDirty();
        return;
      }

      const { start, end } = timeHighlight;

      this.form.reset({
        id,
        start,
        end,
      })
    }),
  }
}
