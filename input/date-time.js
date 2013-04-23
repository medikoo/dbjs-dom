'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('./_controls/input')

  , DateTime = require('dbjs').DateTime
  , castAttribute = DOMInput.prototype.castAttribute
  , Input;

Input = function (document, ns/*, options*/) {
	DOMInput.call(this, document, ns, arguments[2]);
	this.dom.setAttribute('type', 'datetime-local');
	if (ns.max) this.castAttribute('max', ns.max);
	if (ns.min) this.castAttribute('min', ns.min);
	if (ns.step) this.dom.setAttribute('step', ns.step);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	dateAttributes: d({ min: true, max: true }),
	_dateToInputValue: d(function (date) {
		return date.toISOString().slice(0, 16);
	}),
	value: d.gs(function () {
		var value = this.dom.value;
		if (!value) return null;
		value = this.ns.normalize(new Date(Date.parse(value)));
		if (this._value && (value.valueOf() === this._value.valueOf())) {
			return this._value;
		}
		return value;
	}, function (value) {
		var strValue;
		if (value == null) {
			value = null;
			this.dom.value = '';
			this.dom.removeAttribute('value');
		} else {
			strValue = this._dateToInputValue(value);
			this.dom.value = strValue;
			this.dom.setAttribute('value', strValue);
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	}),
	castAttribute: d(function (name, value) {
		if (this.dateAttributes[name] && isDate(value)) {
			this.dom.setAttribute(name, this._dateToInputValue(value));
		} else {
			castAttribute.call(this, name, value);
		}
	})
});

module.exports = Object.defineProperties(DateTime, {
	unserializeDOMInputValue: d(function (value) {
		if (value == null) return null;
		value = Date.parse(value);
		return isNaN(value) ? null : this(value);
	}),
	DOMInput: d(Input),
});
