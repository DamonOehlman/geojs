var test = require('tape');
var Pos = require('../pos');
var testdata = ['-27 153', '-27.54 153.67', '15 167'];
var out;

test('can parse an array of position strings into position objects', function(t) {
  t.plan(2);

  out = testdata.map(Pos);
  t.ok(Array.isArray(out), 'parsed array');
  t.equal(out.length, 3);
});

test('item 1 parsed ok', function(t) {
  t.plan(2);
  t.equal(out[0].lat, -27);
  t.equal(out[0].lon, 153);
});

test('item 2 parsed ok', function(t) {
  t.plan(2);
  t.equal(out[1].lat, -27.54);
  t.equal(out[1].lon, 153.67);
});

test('item 3 parsed ok', function(t) {
  t.plan(2);
  t.equal(out[2].lat, 15);
  t.equal(out[2].lon, 167);
});