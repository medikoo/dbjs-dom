'use strict';

var copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d/d')
  , memoize  = require('memoizee/lib/regular')
  , DOMInput = require('../_controls/input')
  , setup    = require('../')

  , defineProperty = Object.defineProperty
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
	this.dom.addEventListener('input', this.onChange, false);
	this.dom.addEventListener('keyup', this.onChange, false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ autocomplete: true, dirname: true, inputmode: true, list: true,
			maxlength: true, pattern: true, placeholder: true, readonly: true,
			required: true, size: true })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes),
		{ max: 'maxlength', pattern: true, inputPlaceholder: 'placeholder',
			required: true })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'text');
	})
});

module.exports = exports = memoize(function (db) {
	defineProperty(setup(db).StringLine, 'DOMInput', d(Input));
});

exports.Input = Input;
