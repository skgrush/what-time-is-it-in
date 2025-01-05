
export type ICoordinate = {
  readonly latitude: number;
  readonly longitude: number;
}

export function euclidianDistance(a: ICoordinate, b: ICoordinate) {
  return Math.sqrt(
    (a.longitude - b.longitude)**2 +
    (a.latitude - b.latitude)**2
  );
}
