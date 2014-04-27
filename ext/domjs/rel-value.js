'use strict';

var d              = require('d')
  , memoizeMethods = require('memoizee/methods-plain')
  , RelValue       = require('../../text/utils/rel-value');

Object.defineProperties(RelValue.prototype, memoizeMethods({
	render: d(function (value) {
		if (!this.domjs) return this.cb(value);
		return this.domjs.safeCollect(function () {
			return this.cb(value);
		}.bind(this));
	}, { getNormalizer: require('memoizee/normalizers/get-1') })
}));
