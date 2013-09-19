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

test('can create a bbox from a space separated string of lat and lngs', function(t) {
  var b;

  t.plan(5);
  b = new BBox('-28.1819 153.1453 -27.9935 153.4162');
  t.ok(b instanceof BBox, 'created BBox');
  t.equal(b.min.lat, -28.1819);
  t.equal(b.min.lon, 153.1453);
  t.equal(b.max.lat, -27.9935);
  t.equal(b.max.lon, 153.4162);
});

test('can create a bbox from a comma separated min and max', function(t) {
  var b;

  t.plan(5);
  b = new BBox('-28.1819,153.1453', '-27.9935,153.4162');
  t.ok(b instanceof BBox, 'created BBox');
  t.equal(b.min.lat, -28.1819);
  t.equal(b.min.lon, 153.1453);
  t.equal(b.max.lat, -27.9935);
  t.equal(b.max.lon, 153.4162);
});

test('can create a bbox from a space separated min and max', function(t) {
  var b;

  t.plan(5);
  b = new BBox('-28.1819 153.1453', '-27.9935 153.4162');
  t.ok(b instanceof BBox, 'created BBox');
  t.equal(b.min.lat, -28.1819);
  t.equal(b.min.lon, 153.1453);
  t.equal(b.max.lat, -27.9935);
  t.equal(b.max.lon, 153.4162);
});

test('can create a bbox from simple object min and max', function(t) {
  var b;

  t.plan(5);
  b = new BBox({ lat: -28.1819, lon: 153.1453 }, { lat: -27.9935, lng: 153.4162 });
  t.ok(b instanceof BBox, 'created BBox');
  t.equal(b.min.lat, -28.1819);
  t.equal(b.min.lon, 153.1453);
  t.equal(b.max.lat, -27.9935);
  t.equal(b.max.lon, 153.4162);
});