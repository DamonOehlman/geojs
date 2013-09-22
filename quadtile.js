/**
  ### quadtile

  ```js
  var quadtile = require('geojs/quadtile')();
  ```

  This is a latlon -> [quadtile](http://wiki.openstreetmap.org/wiki/QuadTiles)
  converter catering for variable precision.

  #### Example Usage

  ```js
  // require the quadtile module using default precision (32bit)
  var quadtile = require('quadtile')()

  // convert a latitude and longitude into a 32bit quadtile
  console.log(quadtile(-33.876403, 151.205349));
  ```

**/
module.exports = function(precision) {
  var maxVal;
  var maxBits;

  // default precision to 32bit
  precision = precision || 32;

  // calculate the max bits (precision / 2)
  maxBits = precision >> 1;

  // calculate the maximum value
  maxVal = Math.pow(2, maxBits) - 1;

  return function(lat, lon) {
    // calculate the x and y
    var x = ((lon + 180) * maxVal / 360) | 0;
    var y = ((lat + 90) * maxVal / 180) | 0;
    var tile = 0;

    for (var ii = maxBits - 1; ii--; ) {
      tile = (tile << 1) | ((x >> ii) & 1);
      tile = (tile << 1) | ((y >> ii) & 1);
    }

    return tile;
  }
};