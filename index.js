/* jshint node: true */
'use strict';

/**
  # geojs

  Geospatial types and functions for JS.  This is the new revised 1.x branch
  of the GeoJS library which will provide a browserify friendly set types
  and functions designed for working with spatial data.

  A lot has happened since I decoupled some of the spatial logic within
  Tile5 into the original geojs library, and I'm incorporating a lot of
  what I've learnt along the way into this rebuilt from scratch version
  of the libary.

  ## Installing

  As the `1.x` branch of geojs is not yet published in npm you will need to
  npm install it using a `git://` url at present:

  ```
  npm install git://github.com/DamonOehlman/geojs.git#1.x --save
  ```

**/

exports.Pos = require('./pos');
exports.BBox = require('./bbox');
