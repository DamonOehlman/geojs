/**
  ### quadtile

  ```js
  var quadtile = require('geojs/quadtile');
  ```

  This is a latlon -> 32bit
  [quadtile](http://wiki.openstreetmap.org/wiki/QuadTiles) converter.

  <<< examples/quadtile.js

**/
var MASKS  = [0x55555555, 0x33333333, 0x0F0F0F0F, 0x00FF00FF, 0x0000FFFF];

var quadtile = module.exports = function(lat, lon) {
  // calculate the x and y (to within the 65535 value range) int values
  var x = ((lon + 180) * 0xFFFF / 360) | 0;
  var y = ((lat + 90) * 0xFFFF / 180) | 0;

  // apply the interleaving to x
  x = (x | (x << 8)) & MASKS[3];
  x = (x | (x << 4)) & MASKS[2];
  x = (x | (x << 2)) & MASKS[1];
  x = (x | (x << 1)) & MASKS[0];

  // and then to y
  y = (y | (y << 8)) & MASKS[3];
  y = (y | (y << 4)) & MASKS[2];
  y = (y | (y << 2)) & MASKS[1];
  y = (y | (y << 1)) & MASKS[0];

  // return the interleaved values
  return x | (y << 1);
};

/**
  ### quadtile.reverse


**/
quadtile.reverse = function(z) {
  var x;
  var y;

  x = z & MASKS[0];
  x = (x | (x >> 1)) & MASKS[1];
  x = (x | (x >> 2)) & MASKS[2];
  x = (x | (x >> 4)) & MASKS[3];
  x = (x | (x >> 8)) & MASKS[4];

  y = (z >> 1) & MASKS[0];
  y = (y | (y >> 1)) & MASKS[1];
  y = (y | (y >> 2)) & MASKS[2];
  y = (y | (y >> 4)) & MASKS[3];
  y = (y | (y >> 8)) & MASKS[4];

  // return a 2 element array of latitude and longitude
  return [
    y / 0xFFFF * 180 - 90,
    x / 0xFFFF * 360 - 180
  ];
};

// module.exports = function(precision) {
//   var maxVal;
//   var maxBits;

//   // default precision to 32bit
//   precision = precision || 32;

//   // calculate the max bits (precision / 2)
//   maxBits = precision >> 1;

//   // calculate the maximum value
//   maxVal = Math.pow(2, maxBits) - 1;

//   return function(lat, lon) {
//     // calculate the x and y
//     var x = ((lon + 180) * maxVal / 360) | 0;
//     var y = ((lat + 90) * maxVal / 180) | 0;
//     var tile = 0;

//     for (var ii = maxBits - 1; ii--; ) {
//       tile = (tile << 1) | ((x >> ii) & 1);
//       tile = (tile << 1) | ((y >> ii) & 1);
//     }

//     return tile;
//   }
// };