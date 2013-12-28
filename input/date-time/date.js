'use strict';

var memoize  = require('memoizee/lib/regular')
  , d        = require('d/d')
  , setup    = require('../')
  , DOMInput = require('../5.date-time').Input

  , defineProperties = Object.defineProperties
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
	defineProperties(setup(db).Date, {
		toInputValue: d(function (value) {
			return (value == null) ? null : value.toISOString().slice(0, 10);
		}),
		DOMInput: d(Input)
	});
});

exports.Input = Input;
