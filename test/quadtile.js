var test = require('tape');
var quadtile = require('../quadtile');
var lat = -33.876403;
var lon = 151.205349;

test('can calculate a forward value', function(t) {
  t.plan(1);
  console.log(quadtile(lat, lon));

  var latlon = quadtile.reverse(quadtile(lat, lon));
  console.log(latlon);
  console.log(lat - latlon[0], lon - latlon[1]);

  t.pass();
});