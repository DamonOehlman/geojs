/* jshint node: true */
'use strict';

var Pos = require('./pos');

/**
  ### BBox(args*)

  Create a new geospatial bounding box.  A bounding box describes two 
  geospatial positions (a min and a max) that  describe a rectangular region.

  You can think of it something like the simple diagram shown below:

  ```
       __________ max
      |          |
      |          |
      |          |
  min  __________

  ```

  Within geojs a bounding box can be constructed in a number of ways:

  #### Providing min and max positions as arguments

  ```js
  var bbox = new geojs.BBox(min, max);
  ```

**/
function BBox(a, b, c, d) {
  if (! (this instanceof BBox)) {
    return new BBox(a, b, c, d);
  }

  var aIsStr = typeof a == 'string' || (a instanceof String);
  var bIsStr = typeof b == 'string' || (b instanceof String);

  // if we have been provided only one argument and it's a string
  // then we need to parse it into separate arguments
  if (arguments.length === 1 && aIsStr) {
    return BBox.apply(this, a.split(/[\s\,]\s*/));
  }
  // if we have been provided 4 arguments
  // then we are dealing with the minlat, minlon, maxlat, maxlon case
  else if (arguments.length === 4) {
    b = new Pos(c, d);
    a = new Pos(a, b);
  }
  // if a and b are both position objects, then we are gold
  else if ((a instanceof Pos) && (b instanceof Pos)) {
    // nothing to do
  }
  // otherwise, run a and b through the position conversion safety check
  else {
    a = new Pos(a);
    b = new Pos(b);
  }

  // initialise the min and the max
  this.min = a;
  this.max = b;
}

module.exports = BBox;