# geojs

Geospatial types and functions for JS.  This is the new revised 1.x branch
of the GeoJS library which will provide a browserify friendly set types
and functions designed for working with spatial data.

A lot has happened since I decoupled some of the spatial logic within
Tile5 into the original geojs library, and I'm incorporating a lot of
what I've learnt along the way into this rebuilt from scratch version
of the libary.

[![Build Status](https://travis-ci.org/DamonOehlman/geojs.png?branch=master)](https://travis-ci.org/DamonOehlman/geojs)

## Installing

As the `1.x` branch of geojs is not yet published in npm you will need to
npm install it using a `git://` url at present:

```
npm install git://github.com/DamonOehlman/geojs.git#1.x --save
```

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

### quadtile

```js
var quadtile = require('geojs/quadtile');
```

This is a latlon -> 32bit
[quadtile](http://wiki.openstreetmap.org/wiki/QuadTiles) converter.

```js
// require the quadtile module using default precision (32bit)
var quadtile = require('geojs/quadtile');

// convert a latitude and longitude into a 32bit quadtile
console.log(quadtile(-33.876403, 151.205349));
// --> 1961878035
```

### quadtile.reverse

## License(s)

### MIT

Copyright (c) 2013 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
