import { ICoordinate, manhattanDistance } from './ICoordinate';
import { ITimeZoneName } from '../types/region-zone-mapping';

export class TzDbTabFile {

  public static readonly entryRe = /(.*?)\n/g;

  /** All entries sorted by longitude. */
  public readonly entries: readonly TzDbTabEntry[];

  protected constructor(
    entries: readonly TzDbTabEntry[],
  ) {
    this.entries = entries.toSorted(TzDbTabFile.tabEntrySorter);
  }

  binarySearchNearest(coord: ICoordinate) {
    try {
      const entries = this.entries;
      let l = 0;
      let r = this.entries.length - 1;
      let lastM = r;

      while (l <= r) {
        const m = lastM = Math.floor((l + r) / 2);
        const entry = entries[m];
        if (entry.coordinates.longitude < coord.longitude) {
          l = m + 1;
        } else if (entry.coordinates.longitude > coord.longitude) {
          r = m - 1;
        } else {
          break;
        }
      }

      const closestIdx = lastM;

      let closestEntry = entries[closestIdx];
      let closestEntryManhattanDistance = manhattanDistance(closestEntry.coordinates, coord);

      const originalClosestEntryManhattanDistance = closestEntryManhattanDistance;

      let searchLeft = true;
      let searchRight = true;

      // check each entry radially out from the list until the longitude
      let offset = 1;
      while (searchLeft && searchRight) {
        if (searchLeft) {
          const left = entries[closestIdx - offset];
          const result = this.#getManhattanDistance(
            coord,
            left?.coordinates,
            [closestEntry, closestEntryManhattanDistance],
            originalClosestEntryManhattanDistance,
          );

          if (!result.keepSearching) {
            searchLeft = false;
          } else if (result.isCloser) {
            closestEntry = left;
            closestEntryManhattanDistance = result.manhattanDistance;
          }
        }

        if (searchRight) {
          const right = entries[closestIdx + offset];
          const result = this.#getManhattanDistance(
            coord,
            right?.coordinates,
            [closestEntry, closestEntryManhattanDistance],
            originalClosestEntryManhattanDistance,
          );

          if (!result.keepSearching) {
            searchLeft = false;
          } else if (result.isCloser) {
            closestEntry = right;
            closestEntryManhattanDistance = result.manhattanDistance;
          }
        }

        ++offset;
      }

      return {
        closest: closestEntry,
      };
    } catch (e) {
      debugger;
      throw e;
    }
  }

  #getManhattanDistance(
    coordinateWeWereSearchingFor: ICoordinate,
    coordinateWeAreChecking: undefined | ICoordinate,
    currentClosest: [entry: TzDbTabEntry, manhattanDistance: number],
    manhattanDistanceOfClosestLongitude: number,
  ): { keepSearching: boolean } & ({ isCloser: false } | { isCloser: true, manhattanDistance: number }) {

    if (!coordinateWeAreChecking) {
      return { keepSearching: false, isCloser: false };
    }

    const manhattanDistanceOfCheckedCoordinate = manhattanDistance(coordinateWeWereSearchingFor, coordinateWeAreChecking);

    if (manhattanDistanceOfCheckedCoordinate < currentClosest[1]) {
      return { keepSearching: true, isCloser: true, manhattanDistance: manhattanDistanceOfCheckedCoordinate };
    }
    if (Math.abs(coordinateWeWereSearchingFor.longitude - coordinateWeAreChecking.longitude) > manhattanDistanceOfClosestLongitude) {
      return { keepSearching: false, isCloser: false };
    }

    return { keepSearching: true, isCloser: false };
  }

  static parseTabFile(fileContents: string) {

    const entryIterator = this.#getEntries(fileContents);
    const nonCommentEntryIterator = this.#filterOutCommentEntries(entryIterator);
    const tabClassIterator = this.#entriesToClasses(nonCommentEntryIterator);

    return new TzDbTabFile([...tabClassIterator]);
  }

  static readonly tabEntrySorter = (a: TzDbTabEntry, b: TzDbTabEntry) => {
    const latDiff = a.coordinates.longitude - b.coordinates.longitude;
    if (latDiff !== 0) {
      return latDiff;
    }
    return a.coordinates.latitude - b.coordinates.latitude;
  }

  static *#entriesToClasses(entries: Iterable<string>) {
    for (const entry of entries) {
      yield TzDbTabEntry.fromEntry(entry);
    }
  }

  static *#filterOutCommentEntries(entryIterator: Iterable<string>) {
    for (const entry of entryIterator) {
      if (entry[0] !== '#') {
        yield entry;
      }
    }
  }

  static *#getEntries(fileContents: string) {

    for (const entry of fileContents.matchAll(this.entryRe)) {
      yield entry[1];
    }
  }
}

export class TzDbTabEntry {
  public static readonly coordinateWithoutSecondsRe = /^(?<latDeg>[+-]\d{2})(?<latMin>\d{2})(?<lonDeg>[+-]\d{3})(?<lonMin>\d{2})$/;
  public static readonly coordinateWithSecondsRe = /^(?<latDeg>[+-]\d{2})(?<latMin>\d{2})(?<latSec>\d{2})(?<lonDeg>[+-]\d{3})(?<lonMin>\d{2})(?<lonSec>\d{2})$/;

  constructor(
    readonly codes: ReadonlySet<string>,
    readonly coordinates: ICoordinate,
    readonly timeZone: ITimeZoneName,
    readonly comments?: string,
  ) {
  }

  public static fromEntry(entry: string) {
    const [codesString, coordinatesString, timeZone, comments] = entry.split('\t');

    return new TzDbTabEntry(
      new Set(codesString.split(',')),
      this.#coordinatesFromString(coordinatesString),
      timeZone as ITimeZoneName,
      comments,
    );
  }

  static #coordinatesFromString(coordinateString: string) {
    const coordsMatch =
      this.coordinateWithoutSecondsRe.exec(coordinateString)
      ?? this.coordinateWithSecondsRe.exec(coordinateString);

    if (!coordsMatch?.groups) {
      throw new Error(`Failed to parse coordinate ${coordinateString}`);
    }

    return {
      latitude: this.#_coordComponentFromRegex(coordsMatch.groups, 'lat'),
      longitude: this.#_coordComponentFromRegex(coordsMatch.groups, 'lon'),
    };
  }
  static #_coordComponentFromRegex(groups: Record<string, string>, compo: 'lat' | 'lon') {
    const secKey = `${compo}Sec`;
    return Number(groups[compo + 'Deg']) + Number(groups[compo + 'Min']) / 60 + (
      secKey in groups
        ? Number(groups[secKey]) / 3600
        : 0
    );
  }
}
