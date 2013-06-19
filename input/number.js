'use strict';

var copy     = require('es5-ext/lib/Object/copy')
  , extend   = require('es5-ext/lib/Object/extend')
  , d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('./_controls/input')

  , castControlAttribute = DOMInput.prototype.castControlAttribute
  , NumberType = Db.Number
  , Input;

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
	this.control.addEventListener('input', this.onChange, false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ autocomplete: true, list: true, max: true, min: true, placeholder: true,
			readonly: true, required: true, step: true })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
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
			} else if (!isFinite(value)) {
				value = null;
			}
		}
		castControlAttribute.call(this, name, value);
	})
});

module.exports = Object.defineProperties(NumberType, {
	fromInputValue: d(function (value) {
		if (value == null) return null;
		value = value.trim();
		return (!value || isNaN(value)) ? null : Number(value);
	}),
	DOMInput: d(Input)
});
