'use strict';

var memoize      = require('memoizee/plain')
  , text         = require('../text')
  , baseType     = require('./1.base')
  , booleanType  = require('./2.boolean')
  , numberType   = require('./3.number')
  , stringType   = require('./4.string')
  , dateTimeType = require('./5.date-time')
  , objectType   = require('./6.object');

require('./observable');

module.exports = memoize(function (db) {
	text(db);
	baseType(db);
	booleanType(db);
	numberType(db);
	stringType(db);
	dateTimeType(db);
	objectType(db);
	return db;
}, { normalizer: require('memoizee/normalizers/get-1')() });
