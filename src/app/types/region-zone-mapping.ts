
export type ITimeZoneRegion = string;
export type ITimeZoneName = 'UTC' | `${ITimeZoneRegion}/${string}`;
export type RegionZoneMapping = Readonly<Record<ITimeZoneRegion, ReadonlyArray<ITimeZoneName>>>
