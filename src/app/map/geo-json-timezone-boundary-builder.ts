import { GeoJson2dCoordinatePoint, GeoJson2dCoordinateSet, IGeoJsonFeature, IGeoJsonFeatureCollection, IGeoJsonGeometry } from '../data/geo-json';
import { ITimeZoneName } from '../types/region-zone-mapping';
import { ICoordinate } from './ICoordinate';

type TData = {
  readonly tzid: ITimeZoneName;
}

type RecursiveNumberArray = readonly number[] | readonly RecursiveNumberArray[];

Error.stackTraceLimit = Infinity;

/**
 * Parser for the GeoJSON output files from evansiroky/timezone-boundary-builder.
 *
 * @link https://github.com/evansiroky/timezone-boundary-builder
 */
export class GeoJsonTimezoneBoundaryBuilder {

  constructor(
    public readonly features: readonly TimeZoneBoundaryFeature[],
  ) {
  }

  public getContainingFeature(coord: ICoordinate) {
    for (const feature of this.features) {
      if (feature.geometry.contains(coord)) {
        return feature;
      }
    }
    return null;
  }

  static parseFileToFeatures(json: IGeoJsonFeatureCollection<TData>): Iterable<TimeZoneBoundaryFeature> {
    if (json.type !== 'FeatureCollection') {
      throw new Error('geojson type is not FeatureCollection');
    }

    const featureJsonIterator = this.#iterateFeatures(json);
    const featureClassIterator = this.#iterateParseFeatures(featureJsonIterator);

    return featureClassIterator;
  }

  static *#iterateFeatures(json: IGeoJsonFeatureCollection<TData>) {
    for (const feature of json.features) {
      yield feature;
    }
  }

  static *#iterateParseFeatures(featureIterator: Iterable<IGeoJsonFeature<TData>>) {
    for (const feature of featureIterator) {
      yield TimeZoneBoundaryFeature.fromFeature(feature);
    }
  }
}

export class TimeZoneBoundaryFeature {

  protected constructor(
    public readonly geometry: GeometryPointSetBase,
    public readonly tzid: ITimeZoneName,
  ) {}

  static fromFeature(feature: IGeoJsonFeature<TData>) {
    if (feature.type !== 'Feature' || !feature.properties?.tzid) {
      console.error('error context', feature);
      throw new Error('non-feature or missing tzid in properties');
    }

    return new TimeZoneBoundaryFeature(
      GeometryPointSetBase.fromGeometry(feature.geometry),
      feature.properties.tzid,
    );
  }
}

export abstract class GeometryPointSetBase {
  public abstract contains(coord: ICoordinate): boolean;

  public static fromGeometry(geometry: IGeoJsonGeometry): GeometryPointSetBase {
    switch (geometry.type) {
      case 'Polygon':
        return new GeometryPointPolygon(geometry.coordinates);
      case 'MultiPolygon':
        return new GeometryPointMultiPolygon(
          geometry.coordinates.map(g => new GeometryPointPolygon(g))
        );
      default:
        throw new Error(`Unsupported type '${(geometry as any).type}'`);
    }
  }

  public static *getAllOfIdx<T extends ReadonlyArray<ReadonlyArray<number>>>(values: T, idx: number): Generator<number, void, unknown> {
    for (let array of values) {
      yield array[idx];
    }
  }
}

enum IntersectedBy {
  False = 0,
  Indeterminate = 1,
  OnRight = 2,
  OnLeft = 4,
}

type Intersection = {
  intersector: SimpleRightHandRuleLine;
  intersected: SimpleRightHandRuleLine;
  onSide: IntersectedBy;
  // atDistance: number;
}

const x = 0;
const y = 1;
const epsilon = 1e-6;

class SimpleRightHandRuleLine {



  constructor(
    public readonly start: readonly [x: number, y: number],
    public readonly end: readonly [x: number, y: number],
  ) {
  }

  /**
   * Determine if/how `intersector` intersects this line.
   *
   * @link https://stackoverflow.com/a/218081
   */
  public isIntersectedBy(intersector: SimpleRightHandRuleLine): undefined | Intersection {
    // Convert vector 1 to a line (line 1) of infinite length.
    // We want the line in linear equation standard form: A*x + B*y + C = 0
    // See: http://en.wikipedia.org/wiki/Linear_equation
    const a1 = this.end[y] - this.start[y];
    const b1 = this.start[x] - this.end[x];
    const c1 = (this.end[x] * this.start[y]) - (this.start[x] * this.end[y]);

    // Every point (x,y), that solves the equation above, is on the line,
    // every point that does not solve it, is not. The equation will have a
    // positive result if it is on one side of the line and a negative one
    // if is on the other side of it. We insert (x1,y1) and (x2,y2) of vector
    // 2 into the equation above.
    const d1 = (a1 * intersector.start[x]) + (b1 * intersector.start[y]) + c1;
    const d2 = (a1 * intersector.end[x]) + (b1 * intersector.end[y]) + c1;

    // If d1 and d2 both have the same sign, they are both on the same side
    // of our line 1 and in that case no intersection is possible. Careful,
    // 0 is a special case, that's why we don't test ">=" and "<=",
    // but "<" and ">".
    if (d1 > 0 && d2 > 0) return undefined;
    if (d1 < 0 && d2 < 0) return undefined;

    // The fact that vector 2 intersected the infinite line 1 above doesn't
    // mean it also intersects the vector 1. Vector 1 is only a subset of that
    // infinite line 1, so it may have intersected that line before the vector
    // started or after it ended. To know for sure, we have to repeat the
    // the same test the other way round. We start by calculating the
    // infinite line 2 in linear equation standard form.
    const a2 = intersector.end[y] - intersector.start[y];
    const b2 = intersector.start[x] - intersector.end[x];
    const c2 = (intersector.end[x] * intersector.start[y]) - (intersector.start[x] * intersector.end[y]);

    // Calculate d1 and d2 again, this time using points of vector 1.
    const d3 = (a2 * this.start[x]) + (b2 * this.start[y]) + c2;
    const d4 = (a2 * this.end[x]) + (b2 * this.end[y]) + c2;

    // Again, if both have the same sign (and neither one is 0),
    // no intersection is possible.
    if (d3 > 0 && d4 > 0) return undefined;
    if (d3 < 0 && d4 < 0) return undefined;

    // If we get here, only two possibilities are left. Either the two
    // vectors intersect in exactly one point or they are collinear, which
    // means they intersect in any number of points from zero to infinite.
    if (Math.abs((a1 * b2) - (a2 * b1)) < epsilon) {
      return {
        intersected: this,
        intersector,
        onSide: IntersectedBy.Indeterminate,
        // atDistance: NaN,
      };
    }

    // If they are not collinear, they must intersect in exactly one point.
    return {
      intersected: this,
      intersector,
      onSide: d3 < 0 ? IntersectedBy.OnRight : IntersectedBy.OnLeft,
      // atDistance: NaN,
    };
  }
}

// const upDown = new SimpleRightHandRuleLine(
//   [0, 10],
//   [0, -10],
// );
//
// const upDownOffset = new SimpleRightHandRuleLine(
//   [1, 10],
//   [1, -10],
// )
//
// const leftRight = new SimpleRightHandRuleLine(
//   [-10, 0],
//   [10, 0],
// );
//
// const rightLeft = new SimpleRightHandRuleLine(
//   [10, 0],
//   [-10, 0],
// );
//
// const grazesUpDown = new SimpleRightHandRuleLine(
//   [-1, 10],
//   [1, 10],
// )
//
// const lrIntoUd = upDown.isIntersectedBy(leftRight);
// const rlIntoUd = upDown.isIntersectedBy(rightLeft);
//
// const lrIntoRl = rightLeft.isIntersectedBy(leftRight);
//
// const verticalNoIntersect = upDown.isIntersectedBy(upDownOffset);
//
// const graze = upDown.isIntersectedBy(grazesUpDown);
//
// debugger;

class SimplePolygon {
  public readonly lines: readonly SimpleRightHandRuleLine[];

  public readonly minLongitude = Number.NEGATIVE_INFINITY;
  public readonly minLatitude = Number.NEGATIVE_INFINITY;
  public readonly maxLongitude = Number.POSITIVE_INFINITY;
  public readonly maxLatitude = Number.POSITIVE_INFINITY;

  constructor(
    points: ReadonlyArray<GeoJson2dCoordinatePoint>,
    public readonly isHole: boolean = false
  ) {

    const pointsLength = points.length;

    this.lines = [...( function*() {
      for (let i = 0; i < pointsLength - 1; ++i) {
        yield new SimpleRightHandRuleLine(points[i], points[i + 1])
      }
    })()];

    if (pointsLength < 10000) {
      const allLongitude = GeometryPointPolygon.getAllOfIdx(points, 0);
      const allLatitude = GeometryPointPolygon.getAllOfIdx(points, 1);

      this.minLongitude = Math.min(...allLongitude);
      this.minLatitude = Math.min(...allLatitude);
      this.maxLongitude = Math.max(...allLongitude);
      this.maxLatitude = Math.max(...allLatitude);
    } else {
      for (let point of points) {
        this.minLongitude = Math.min(this.minLongitude, point[x]);
        this.minLatitude = Math.min(this.minLatitude, point[y]);
        this.maxLongitude = Math.max(this.maxLongitude, point[x]);
        this.maxLatitude = Math.max(this.maxLatitude, point[y]);
      }
    }
  }

  containsStartPoint(line: SimpleRightHandRuleLine) {
    let lefts = 0;
    let rights = 0;
    let collinears = 0;

    for (let myLine of this.lines) {
      const intersection = myLine.isIntersectedBy(line);
      if (!intersection) {
        continue;
      }
      switch (intersection.onSide) {
        case IntersectedBy.Indeterminate:
          ++collinears;
          continue;
        case IntersectedBy.OnLeft:
          ++lefts;
          continue;
        case IntersectedBy.OnRight:
          ++rights;
          continue;
      }
    }

    // if (collinears === 0) {
      return (rights > lefts) === !this.isHole;
    // }
  }
}

/**
 * GeoJSON polygon.
 * Each linear ring is a closed set of points, first and last are the same.
 * The first ring is the exterior following right-hand rule.
 * Any subsequent ring is a hole, following reverse right-hand rule.
 */
class GeometryPointPolygon extends GeometryPointSetBase {

  public readonly exteriorSurface: SimplePolygon;
  public readonly holeSurfaces: readonly SimplePolygon[];

  constructor(
    public readonly linearRings: GeoJson2dCoordinateSet
  ) {
    super();

    if (linearRings.length === 0) {
      console.warn('Polygon missing linear rings', this);
    }

    this.exteriorSurface = new SimplePolygon(linearRings[0]);
    this.holeSurfaces = linearRings.slice(1).map(r => new SimplePolygon(r, true));


  }

  override contains(coord: ICoordinate): boolean {
    const testVec = new SimpleRightHandRuleLine(
      [coord.longitude, coord.latitude],
      [200, 200],
    );

    return this.containsStartPoint(testVec);
  }

  containsStartPoint(testVec: SimpleRightHandRuleLine) {
    if (
      testVec.start[x] < this.exteriorSurface.minLongitude ||
      testVec.start[y] < this.exteriorSurface.minLatitude ||
      testVec.start[x] > this.exteriorSurface.maxLongitude ||
      testVec.start[y] > this.exteriorSurface.maxLatitude
    ) {
      return false;
    }

    if (!this.exteriorSurface.containsStartPoint(testVec)) {
      return false;
    }

    return this.holeSurfaces.every(hole => !hole.containsStartPoint(testVec));
  }
}

class GeometryPointMultiPolygon extends GeometryPointSetBase {

  constructor(
    private readonly polygons: readonly GeometryPointPolygon[],
  ) {
    super();
  }

  override contains(coord: ICoordinate): boolean {
    const testVec = new SimpleRightHandRuleLine(
      [coord.longitude, coord.latitude],
      [200, 200],
    );

    return this.polygons.some(polygon => polygon.containsStartPoint(testVec));
  }
}
