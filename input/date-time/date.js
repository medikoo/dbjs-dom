'use strict';

var memoize  = require('memoizee/plain')
  , d        = require('d')
  , setup    = require('../')
  , DOMInput = require('../5.date-time').Input

  , defineProperties = Object.defineProperties
  , re = /^(\d{4})-(\d{2})-(\d{2})$/
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'date');
	})
});

module.exports = exports = memoize(function (db) {
	var DateType = setup(db).Date;
	defineProperties(DateType, {
		fromInputValue: d(function (value) {
			var match;
			if (value == null) return null;
			value = value.trim();
			if (!value) return null;
			match = value.match(re);
			if (!match) return null;
			return new DateType(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
		}),
		toInputValue: d(function (value) {
			return (value == null) ? null : value.toISOString().slice(0, 10);
		}),
		DOMInput: d(Input)
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });

exports.Input = Input;
