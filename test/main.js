require('./runner').runTests([
    // core types
    './batches/pos',
    './batches/distance',
    './batches/line',
  
    // plugins
    './batches/plugin',
    './batches/geohash',
    './batches/addressing',
    './batches/serializer'
]);