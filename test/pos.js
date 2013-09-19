var test = require('tape');
var Pos = require('../pos');

test('init pos from integer values', function(t) {
  var p;
  t.plan(3);

  p = new Pos(-27, 153);
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from float values', function(t) {
  var p;
  t.plan(3);

  p = new Pos(-27.345, 153.083);
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27.345);
  t.equal(p.lon, 153.083);
});

test('init pos from string values', function(t) {
  var p;
  t.plan(3);

  p = new Pos('-27', '153');
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from compound string value in first arg (space delim)', function(t) {
  var p;
  t.plan(3);

  p = new Pos('-27 153');
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from compound string value in first arg (comma delim)', function(t) {
  var p;
  t.plan(3);

  p = new Pos('-27,153');
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from compound string value in first arg (comma delim, trailing spaces)', function(t) {
  var p;
  t.plan(3);

  p = new Pos('-27,  153');
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from plain old object, (lat, lon keys)', function(t) {
  var p;
  t.plan(3);

  p = new Pos({ lat: -27, lon: 153 });
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from plain old object, (lat, lng keys)', function(t) {
  var p;
  t.plan(3);

  p = new Pos({ lat: -27, lng: 153 });
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);
});

test('init pos from existing pos instance', function(t) {
  var p;
  var p2;

  t.plan(5);

  p = new Pos({ lat: -27, lng: 153 });
  t.ok(p instanceof Pos, 'created pos');
  t.equal(p.lat, -27);
  t.equal(p.lon, 153);

  p2 = new Pos(p);
  t.ok(p2 instanceof Pos, 'created new pos');
  t.ok(p !== p2, 'p2 is a clone, not the same object');
});