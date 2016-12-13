// @flow
export type Position = {|
  +lat: number,
  +lon: number
|};

export class PosOps {
  static fromString(input: string): Position {
    const parts = input.split(/(\s|\,)/)
      .map(val => parseInt(val, 10))
      .filter(val => !isNaN(val));

    if (parts.length > 2) {
      throw new Error(`unable to parse ${input} into a position value`);
    }

    return { lat: parts[0], lon: parts[1] };
  }

  static clone(input: Position): Position {
    return { lat: input.lat, lon: input.lon };
  }

  static equalTo(a: Position): Position => boolean {
    return b => PosOps.equal(a, b);
  }

  static equal(a: Position, b: Position): boolean {
    return a.lat == b.lat && a.lon == b.lon;
  }

  static empty(pos: Position): boolean {
    return pos.lat == 0 && pos.lon == 0;
  }
}

const testPositions = [
  { lat: 5, lon: 30 },
  { lat: 6, lon: 50 }
];

testPositions.find(PosOps.equalTo({ lat: 5, lon: 38 }));
