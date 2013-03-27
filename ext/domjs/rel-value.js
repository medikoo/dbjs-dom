'use strict';

var memoize  = require('memoizee/lib/regular')
  , RelValue = require('../../text/utils/rel-value');

require('memoizee/lib/ext/method');

Object.defineProperties(RelValue.prototype, memoize(function (value) {
	if (!this.domjs) return this.cb(value);
	return this.domjs.safeCollect(function () {
		return this.cb(value);
	}.bind(this));
}, { method: 'render' }));
