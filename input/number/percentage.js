'use strict';

var memoize  = require('memoizee/plain')
  , d        = require('d')
  , setup    = require('../')
  , DOMInput = require('../3.number').Input

  , defineProperties = Object.defineProperties
  , castControlAttribute = DOMInput.prototype.castControlAttribute
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	castControlAttribute: d(function (name, value) {
		if (name === 'step') value *= 100;
		castControlAttribute.call(this, name, value);
	})
});

module.exports = exports = memoize(function (db) {
	defineProperties(setup(db).Percentage, {
		fromInputValue: d(function (value) {
			if (value == null) return null;
			value = value.trim();
			if (!value || isNaN(value)) return null;
			value = Number(value);
			return value / 100;
		}),
		toInputValue: d(function (value) {
			if (value == null) return null;
			return String(value * 100);
		}),
		DOMInput: d(Input)
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });

exports.Input = Input;
