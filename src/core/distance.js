// @flow
import type { PosRecord } from './position.js';
import { DEGREES_TO_RADIANS, KM_PER_RAD } from './constants.js';

class Distance {
  static calculate(from: PosRecord, to: PosRecord): number {
    const halfDeltaLat = ((to.lat - from.lat) * DEGREES_TO_RADIANS) / 2;
    const halfDeltaLon = ((to.lon - from.lon) * DEGREES_TO_RADIANS) / 2;
    const a = Math.sin(halfDeltaLat) * Math.sin(halfDeltaLat) +
            (Math.cos(from.lat * DEGREES_TO_RADIANS) * Math.cos(to.lat * DEGREES_TO_RADIANS)) *
            (Math.sin(halfDeltaLon) * Math.sin(halfDeltaLon));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return KM_PER_RAD * c;
  }
}
