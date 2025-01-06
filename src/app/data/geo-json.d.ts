
type TDataUnderlyingType = Record<string, string | number | TDataUnderlyingType>;
type TDataType = undefined | Record<string, TDataUnderlyingType>;

export type IGeoJsonFeatureCollection<TData extends TDataType> = {
  readonly type: 'FeatureCollection';
  readonly features: readonly IGeoJsonFeature<TData>[];
}

export type IGeoJsonFeature<TData extends TDataType> = {
  readonly type: 'Feature';
  readonly geometry: IGeoJsonGeometry<TData>;
  readonly properties: TData;
};

export type IGeoJsonGeometry = IGeoJsonGeometryPolygon | IGeoJsonGeometryMultiPolygon;
export type IGeoJsonGeometryPolygon = {
  readonly type: 'Polygon';
  readonly coordinates: GeoJson2dCoordinateSet;
}

// file contains:
//  139x "type"
// ====
//    1x "type":"FeatureCollection"
//   69x "type":"Feature"
//   21x "type":"Polygon"
//   48x "type":"MultiPolygon"

export type IGeoJsonGeometryMultiPolygon = {
  readonly type: 'MultiPolygon';
  readonly coordinates: ReadonlyArray<GeoJson2dCoordinateSet>;
};

type GeoJson2dCoordinateSet = readonly [exterior: ReadonlyArray<GeoJson2dCoordinatePoint>, ...ReadonlyArray<GeoJson2dCoordinatePoint>[]];

type GeoJson2dCoordinatePoint = readonly [number, number];
