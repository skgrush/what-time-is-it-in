import { ITimeHighlight } from './time-highlight';
import { AbstractControl, ValidatorFn } from '@angular/forms';

const timeRegex = /^(\d{1,2}):(\d{2})$/;

export function timeHighlightToPeriodString(highlight: ITimeHighlight) {
  const start = decimalHoursToTime(highlight.start);
  const end = decimalHoursToTime(highlight.end);

  return `${start}-${end}`;
}

export function timeStringToDecimalHours(timeString: string) {
  const match = timeRegex.exec(timeString);
  if (!match) {
    throw new Error(`Failed to parse time string ${timeString}`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour >= 24 || minute >= 60) {
    throw new Error(`Invalid hour-minute pair in time string ${timeString}`);
  }

  return hour + minute / 60;
}

export function periodStringToTimeHighlight(id: string, period: string): ITimeHighlight {
  debugger;
  const split = period.split('-');
  if (split.length !== 2) {
    throw new Error(`Failed to parse period ${period} containing not-exactly 2 segments.`);
  }

  const start = timeStringToDecimalHours(split[0]);
  const end = timeStringToDecimalHours(split[1]);

  return {
    id,
    start,
    end,
  }
}

function decimalHoursToHoursAndMinutes(decimalTime: number) {
  return {
    hours: decimalTime | 0,
    minutes: (60 * (decimalTime % 1)) | 0,
  };
}

export function decimalHoursToTime(value: number): string {
  const { hours, minutes } = decimalHoursToHoursAndMinutes(value);

  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export function decimalHoursToDuration(value: number): string {
  const { hours, minutes } = decimalHoursToHoursAndMinutes(value);

  return `PT${hours}H${minutes.toString().padStart(2, '0')}M`;
}


export function startAndEndToDuration(startValue: number, endValue: number) {
  const [first, second] =
    startValue < endValue
      ? [startValue, endValue]
      : [startValue, endValue + 24];

  return second - first;
}



export function timeIsValid(value: number) {
  return value >= 0 && value < 24;
}

export function rangeIsValid({ start, end }: { start: number; end: number }) {
  const dur = startAndEndToDuration(start, end);
  return timeIsValid(dur);
}

export const timeValidator: ValidatorFn = (control: AbstractControl<number>) => {
  const { value } = control;
  if (typeof value === 'number' && !timeIsValid(value)) {
    return {
      invalidTime: true,
    }
  }
  return null;
}

export const rangeValidator = ((control: AbstractControl<{ start: number, end: number }>) => {
  const { start, end } = control.value;
  if (typeof start === 'number' && typeof end === 'number') {
    const invalidDuration = startAndEndToDuration(start, end);
    if (invalidDuration > 24) {
      return {
        invalidDuration,
      };
    }
  }
  return null;
}) satisfies ValidatorFn;
