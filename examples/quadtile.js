// require the quadtile module using default precision (32bit)
var quadtile = require('../quadtile');

// convert a latitude and longitude into a 32bit quadtile
console.log(quadtile(-33.876403, 151.205349));
// --> 1961878035