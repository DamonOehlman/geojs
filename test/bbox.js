var test = require('tape');
var BBox = require('../bbox');

test('can create a bbox from a comma separated string of lat and lngs', function(t) {
  var b;

  t.plan(5);
  b = new BBox('-28.1819,153.1453,-27.9935,153.4162');
  t.ok(b instanceof BBox, 'created BBox');
  t.equal(b.min.lat, -28.1819);
  t.equal(b.min.lon, 153.1453);
  t.equal(b.max.lat, -27.9935);
  t.equal(b.max.lon, 153.4162);
});