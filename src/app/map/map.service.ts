import { Injectable } from '@angular/core';
import { defer, from } from 'rxjs';

class TabLine {
  public static readonly coordinateWithoutSecondsRe = /^(?<latDeg>[+-]\d{2})(?<latMin>\d{2})(?<lonDeg>[+-]\d{3})(?<lonMin>\d{2})$/;
  public static readonly coordinateWithSecondsRe = /^(?<latDeg>[+-]\d{2})(?<latMin>\d{2})(?<latSec>\d{2})(?<lonDeg>[+-]\d{3})(?<lonMin>\d{2})(?<lonSec>\d{2})$/;

  constructor(
    readonly codes: ReadonlySet<string>,
    readonly coordinates: { readonly latitude: number; readonly longitude: number },
    readonly timeZone: string,
    readonly comments?: string,
  ) {
  }

  public static fromLine(line: string) {
    const [codesString, coordinatesString, timeZone, comments] = line.split('\t');

    return new TabLine(
      new Set(codesString.split(',')),
      this.#coordinatesFromString(coordinatesString),
      timeZone,
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
    return Number(groups[compo + 'Deg']) + Number(groups[compo + 'Min']) * 60 + (
      `${compo}Sec` in groups
        ? Number(groups[compo + 'Sec']) * 3600
        : 0
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class MapService {

  readonly zone1970data$ = defer(() => import('../data/zone1970.tab'));

  constructor() {
    const _dis = this;
    this.zone1970data$.subscribe(module => {
      const lines = this.parseTabFile(module.default);
      debugger;
    })
  }

  parseTabFile(fileContents: string) {

    const lineIterator = this.#getLines(fileContents);
    const nonCommentLineIterator = this.#filterOutCommentLines(lineIterator);
    const tabClassIterator = this.#linesToClasses(nonCommentLineIterator);

    return [...tabClassIterator];
  }

  *#linesToClasses(lines: Iterable<string>) {
    for (const line of lines) {
      yield TabLine.fromLine(line);
    }
  }

  *#filterOutCommentLines(lineIterator: Iterable<string>) {
    for (const line of lineIterator) {
      if (line[0] !== '#') {
        yield line;
      }
    }
  }

  *#getLines(fileContents: string) {

    for (const line of fileContents.matchAll(lineRe)) {
      yield line[1];
    }
  }
}

const lineRe = /(.*?)\n/g;
