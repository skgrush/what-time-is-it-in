import { ITimeZoneName, ITimeZoneRegion } from './region-zone-mapping';

export type ColumnIdType = `zone-${number}`;

export type IZoneInfo = {
  readonly timeZoneRegion: ITimeZoneRegion;
  readonly timeZoneName: ITimeZoneName;
}
