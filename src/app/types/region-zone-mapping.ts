
export type ITimeZoneRegion = string;
export type ITimeZoneName = `${ITimeZoneRegion}/${string}`;
export type RegionZoneMapping = Readonly<Record<ITimeZoneRegion, ReadonlyArray<ITimeZoneName>>>
