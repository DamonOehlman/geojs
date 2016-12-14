// @flow
import { MAX_LON, MIN_LON } from './constants.js';

export type PosRecord = {|
  lat: number,
  lon: number
|};

// format lon, lat
export type PosTuple = [ number, number ];

export class Position {
  static fromString(input: string): PosRecord {
    const parts = input.split(/(\s|\,)/)
      .map(val => parseInt(val, 10))
      .filter(val => !isNaN(val));

    if (parts.length !== 2) {
      throw new Error(`unable to parse ${input} into a position value`);
    }

    return Position.fromTuple(parts);
  }

  static fromTuple(input: PosTuple): PosRecord {
    return { lat: input[1], lon: input[0] };
  }

  static clone(input: PosRecord): PosRecord {
    // clone the pos record but ensure the longitude
    return { lat: input.lat, lon: input.lon % 360 };
  }

  static equalTo(a: PosRecord): PosRecord => boolean {
    return b => Position.equal(a, b);
  }

  static equal(a: PosRecord, b: PosRecord): boolean {
    return a.lat == b.lat && a.lon == b.lon;
  }

  static empty(pos: PosRecord): boolean {
    return pos.lat == 0 && pos.lon == 0;
  }

  static normalize(pos: PosRecord): PosRecord {
    let lon = pos.lon;
    while (lon < MIN_LON) { lon += 360; }
    while (lon > MAX_LON) { lon -= 360; }

    return { lat: pos.lat, lon };
  }
}
