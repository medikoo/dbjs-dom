'use strict';

var copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d')
  , memoize  = require('memoizee/plain')
  , DOMInput = require('../string-line').Input
  , setup    = require('../../')

  , defineProperty = Object.defineProperty
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ dirname: false, inputmode: false, list: false })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'password');
	})
});

module.exports = exports = memoize(function (db) {
	defineProperty(setup(db).Password, 'DOMInput', d(Input));
}, { normalizer: require('memoizee/normalizers/get-1')() });

exports.Input = Input;
