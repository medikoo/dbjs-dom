'use strict';

var pad      = require('es5-ext/number/#/pad')
  , memoize  = require('memoizee/plain')
  , d        = require('d')
  , setup    = require('../../../')
  , DOMInput = require('../../../5.date-time').Input
  , PreInput = require('../../../_controls/input')

  , defineProperties = Object.defineProperties
  , floor = Math.floor, min = Math.min, round = Math.round
  , re = /^(\d{2}):(\d{2})$/
  , castControlAttribute = PreInput.prototype.castControlAttribute
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'time');
	}),
	castControlAttribute: d(function (name, value) {
		if (this.dateAttributes[name] && !isNaN(value)) {
			value = this.type.toInputValue(value);
		}
		if (name === 'step') value = min(round(value / 1000), 1);
		castControlAttribute.call(this, name, value);
	})
});

module.exports = exports = memoize(function (db) {
	defineProperties(setup(db).Time, {
		fromInputValue: d(function (value) {
			var match;
			if (value == null) return null;
			value = value.trim();
			if (!value) return null;
			match = value.match(re);
			if (!match) return null;
			return this.normalize((Number(match[1]) * 1000 * 60 * 60) +
				(Number(match[2]) * 1000 * 60));
		}),
		toInputValue: d(function (value) {
			var minutes;
			if (value == null) return null;
			minutes = floor(value / (1000 * 60));
			return pad.call(floor(minutes / 60), 2) + ':' + pad.call(minutes % 60, 2);
		}),
		DOMInput: d(Input)
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });

exports.Input = Input;
