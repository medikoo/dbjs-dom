'use strict';

var copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d')
  , memoize  = require('memoizee/plain')
  , DOMInput = require('../_controls/input')
  , setup    = require('../')

  , defineProperty = Object.defineProperty
  , castControlAttribute = DOMInput.prototype.castControlAttribute
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
	this.control.addEventListener('input', this.onChange, false);
	this.control.addEventListener('keyup', this.onChange, false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ autocomplete: true, dirname: true, inputmode: true, list: true,
			maxlength: true, pattern: true, placeholder: true, readonly: true,
			required: true, size: true })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes),
		{ max: 'maxlength', inputSize: 'size', pattern: true, inputPlaceholder: 'placeholder',
			required: true })),
	numberAttributes: d({ maxlength: true }),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'text');
	}),
	castControlAttribute: d(function (name, value) {
		if (this.numberAttributes[name]) {
			if (value && value.toDOMAttr) {
				value.toDOMAttr(this.control, name, { bare: true });
				return;
			}
			if (!isFinite(value)) value = null;
		}
		castControlAttribute.call(this, name, value);
	})
});

module.exports = exports = memoize(function (db) {
	defineProperty(setup(db).StringLine, 'DOMInput', d(Input));
}, { normalizer: require('memoizee/normalizers/get-1')() });

exports.Input = Input;
