// @flow
var LAT_VARIABILITIES = [
    1.406245461070741,
    1.321415085624082,
    1.077179995861952,
    0.703119412486786,
    0.488332580888611
];

export const
  MAX_LAT = 90, //  85.0511 * DEGREES_TO_RADIANS // TODO: validate this instead of using HALF_PI
  MIN_LAT = -MAX_LAT,
  MAX_LON = 180,
  MIN_LON = -MAX_LON,

  // having these constants precalculated speeds up math ops
  DEGREES_TO_RADIANS = Math.PI / 180,
  RADIANS_TO_DEGREES = 180 / Math.PI,
  TWO_PI = Math.PI * 2,
  HALF_PI = Math.PI / 2,
  M_PER_KM = 1000,
  KM_PER_RAD = 6371;

// define some constants
var IS_COMMONJS = typeof module != 'undefined' && module.exports,
    VECTOR_SIMPLIFICATION = 3,
    MAX_LAT_RAD = MAX_LAT * DEGREES_TO_RADIANS,
    MIN_LAT_RAD = -MAX_LAT_RAD,
    MAX_LON_RAD = MAX_LON * DEGREES_TO_RADIANS,
    MIN_LON_RAD = -MAX_LON_RAD,
    M_PER_RAD = KM_PER_RAD * M_PER_KM,
    ECC = 0.08181919084262157,
    PHI_EPSILON = 1E-7,
    PHI_MAXITER = 12,

    reDelimitedSplit = /[\,\s]+/;
