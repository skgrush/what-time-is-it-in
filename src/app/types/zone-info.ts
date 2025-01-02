import { ITimeZoneName, ITimeZoneRegion } from './region-zone-mapping';

export type IdType = `zone-${number}`;

export type IZoneInfo = {
  readonly timeZoneRegion: ITimeZoneRegion;
  readonly timeZoneName: ITimeZoneName;
}
