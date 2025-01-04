export class TzDbTabLine {
  public static readonly coordinateWithoutSecondsRe = /^(?<latDeg>[+-]\d{2})(?<latMin>\d{2})(?<lonDeg>[+-]\d{3})(?<lonMin>\d{2})$/;
  public static readonly coordinateWithSecondsRe = /^(?<latDeg>[+-]\d{2})(?<latMin>\d{2})(?<latSec>\d{2})(?<lonDeg>[+-]\d{3})(?<lonMin>\d{2})(?<lonSec>\d{2})$/;

  public static readonly lineRe = /(.*?)\n/g;

  constructor(
    readonly codes: ReadonlySet<string>,
    readonly coordinates: { readonly latitude: number; readonly longitude: number },
    readonly timeZone: string,
    readonly comments?: string,
  ) {
  }

  public static fromLine(line: string) {
    const [codesString, coordinatesString, timeZone, comments] = line.split('\t');

    return new TzDbTabLine(
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
    const secKey = `${compo}Sec`;
    return Number(groups[compo + 'Deg']) + Number(groups[compo + 'Min']) / 60 + (
      secKey in groups
        ? Number(groups[secKey]) / 3600
        : 0
    );
  }

  static parseTabFile(fileContents: string) {

    const lineIterator = this.#getLines(fileContents);
    const nonCommentLineIterator = this.#filterOutCommentLines(lineIterator);
    const tabClassIterator = this.#linesToClasses(nonCommentLineIterator);

    return [...tabClassIterator];
  }

  static *#linesToClasses(lines: Iterable<string>) {
    for (const line of lines) {
      yield TzDbTabLine.fromLine(line);
    }
  }

  static *#filterOutCommentLines(lineIterator: Iterable<string>) {
    for (const line of lineIterator) {
      if (line[0] !== '#') {
        yield line;
      }
    }
  }

  static *#getLines(fileContents: string) {

    for (const line of fileContents.matchAll(this.lineRe)) {
      yield line[1];
    }
  }
}
