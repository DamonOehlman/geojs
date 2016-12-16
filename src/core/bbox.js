// @flow

import type { PosRecord } from './position.js';
import { Position } from './position.js';
import { MAX_LAT, MAX_LON, MIN_LAT, MIN_LON } from './constants.js';

export type BoundsRecord = {
  bottomLeft: PosRecord,
  topRight: PosRecord
};

type BoundingPoints = [ Position, Position, Position, Position ];

class BoundingBox {
  static clone(input): BoundsRecord {
    return {
      bottomLeft: input.bottomLeft,
      topRight: input.topRight
    };
  }

  static normalize(input): BoundsRecord {
    return {
      bottomLeft: Position.normalize(input.bottomLeft),
      topRight: Position.normalize(input.topRight)
    };
  }

  static union(first: BoundsRecord, ...rest: Array<BoundsRecord>): BoundsRecord {
    let union = BoundingBox.clone(first);
    const normalized = rest.map(BoundingBox.normalize);

    for (let ii = 0, count = normalized.length; ii < count; ii++) {
      const bl = normalized[ii].bottomLeft;
      const tr = normalized[ii].topRight;

      union.bottomLeft.lat = Math.min(union.bottomLeft.lat, bl.lat);
      union.bottomLeft.lon = Math.min(union.bottomLeft.lon, bl.lon);
      union.topRight.lat = Math.max(union.topRight.lat, tr.lat);
      union.topRight.lon = Math.max(union.topRight.lon, tr.lon);
    }

    return union;
  }
}
