import { ITimeHighlight } from './time-highlight';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { pickAColorForRangeV1 } from './highlight-color';

/** the number of hours we show before the "now" indicator */
export const hoursOffset = 6;
/** pixel height of a rendered hour */
export const hourHeightPx = 30;
/** the earliest hour we render */
export const minHour = -14;
/** the last hour we render */
export const maxHour = 24 + 14;

const timeRegex = /^(\d{1,2}):(\d{2})$/;

export function timeHighlightToPeriodString(highlight: { readonly start: number, readonly end: number }) {
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
    hex: pickAColorForRangeV1(start, end),
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

export function startAndEndToOrderedPair(startValue: number, endValue: number): [first: number, second: number] {
  const [first, second] =
    startValue < endValue
      ? [startValue, endValue]
      : [startValue, endValue + 24];

  return [first, second];
}

export function startAndEndToDuration(startValue: number, endValue: number) {
  const [first, second] = startAndEndToOrderedPair(startValue, endValue);

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
