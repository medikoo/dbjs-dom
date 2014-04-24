'use strict';

var copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d')
  , DOMInput = require('./_controls/input')

  , defineProperties = Object.defineProperties
  , castControlAttribute = DOMInput.prototype.castControlAttribute
  , Input;

Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
	this.control.addEventListener('input', this.onChange, false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ autocomplete: true, list: true, max: true, min: true, placeholder: true,
			readonly: true, required: true, step: true })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes),
		{ max: true, min: true, inputPlaceholder: 'placeholder', required: true,
			step: true })),
	numberAttributes: d({ min: true, max: true }),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'number');
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

module.exports = exports = function (db) {
	defineProperties(db.Number, {
		fromInputValue: d(function (value) {
			if (value == null) return null;
			value = value.trim();
			return (!value || isNaN(value)) ? null : Number(value);
		}),
		DOMInput: d(Input)
	});
};

exports.Input = Input;
