// @flow
import {
  MAX_LON,
  MIN_LON,
  DEGREES_TO_RADIANS,
  RADIANS_TO_DEGREES,
  KM_PER_RAD,
  HALF_PI,
  TWO_PI
} from './constants.js';

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

  // adapted from: http://www.movable-type.co.uk/scripts/latlong.html
  static bearing(src: PosRecord, target: PosRecord): number {
    const
      lat1 = src.lat * DEGREES_TO_RADIANS,
      lat2 = target.lat * DEGREES_TO_RADIANS,
      dlon = (target.lon - src.lon) * DEGREES_TO_RADIANS,
      y = Math.sin(dlon) * Math.cos(lat2),
      x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlon),
      brng = Math.atan2(y, x);

    return (brng * RADIANS_TO_DEGREES + 360) % 360;
  }

  /**
  Return a new position which is the original `pos` offset by
  the specified `latOffset` and `lonOffset` (which are specified in
  km distance)
  */
  static offset(src: PosRecord, latOffset: number, lonOffset: number): PosRecord {
    const
      radOffsetLat = latOffset / KM_PER_RAD,
      radOffsetLon = lonOffset / KM_PER_RAD,
      radLat = src.lat * DEGREES_TO_RADIANS,
      radLon = src.lon * DEGREES_TO_RADIANS,
      deltaLon = Math.asin(Math.sin(radOffsetLon) / Math.cos(radLat));

    let
      newLat = radLat + radOffsetLat,
      newLon = radLon + deltaLon;

    // if the new latitude has wrapped, then update
    newLat = ((newLat + HALF_PI) % Math.PI) - HALF_PI;
    newLon = newLon % TWO_PI;

    return {
      lat: newLat * RADIANS_TO_DEGREES,
      lon: newLon * RADIANS_TO_DEGREES
    };
  }
}
