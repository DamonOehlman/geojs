/* jshint node: true */
'use strict';

/**
  ### Pos(p1, p2)

  Create a new geospatial position object. The constructor can handle a number
  of variants:

  #### Latitude and Longitude provided as numeric arguments

  ```js
  var p = new geojs.Pos(-27, 153);
  ```

  #### Latitude and Longitude provided as a single string argument

  ```js
  var p = new geojs.Pos('-27 153'); // comma delimited ok too
  ```

  #### Latitude and Longitude provided as a plain old object

  ```js
  var p = new geojs.Pos({ lat: 27, lon: 153 });
  ```

  OR:

  ```js
  var p = new geojs.Pos({ lat: 27, lng: 153 });
  ```

  #### Clone from an existing Pos object

  ```js
  var p = new geojs.Pos(p1);
  ```

  #### Parse from an array of Position strings

  ```js
  var positions = ['-27 153', '15 167'].map(Pos);
  ```
  
**/
function Pos(x, y) {
  if (! (this instanceof Pos)) {
    return new Pos(x, y);
  }

  var parts;
  var xIsStr = typeof x == 'string' || (x instanceof String);
  var yIsStr = typeof y == 'string' || (y instanceof String);

  // handle object instances for x 
  if (typeof x == 'object' && (! xIsStr)) {
    y = parseFloat(x.lon);
    if (typeof x.lng != 'undefined') {
      y = parseFloat(x.lng);
    }

    x = parseFloat(x.lat);
  }
  // handle strings provided for x and y
  else if (xIsStr && yIsStr) {
    x = parseFloat(x);
    y = parseFloat(y);
  }
  // otherwise if just x is a string (ignore the remaining parts)
  else if (xIsStr) {
    parts = x.split(/[\s\,]\s*/);

    x = parseFloat(parts[0]);
    y = parseFloat(parts[1]);
  }

  // initialise lat and lon
  this.lat = x;
  this.lon = y;
}

module.exports = Pos;