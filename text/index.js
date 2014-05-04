'use strict';

var memoize     = require('memoizee/plain')
  , validDb     = require('dbjs/valid-dbjs')
  , baseType    = require('./1.base')
  , booleanType = require('./2.boolean')
  , objectType  = require('./3.object');

require('./observable');

module.exports = memoize(function (db) {
	baseType(validDb(db));
	booleanType(db);
	objectType(db);
	return db;
}, { normalizer: require('memoizee/normalizers/get-1')() });
