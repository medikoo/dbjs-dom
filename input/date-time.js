'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('./_controls/input')

  , DateTime = require('dbjs').DateTime
  , castAttribute = DOMInput.prototype.castAttribute
  , Input;

require('./');

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
	value: d.gs(function () {
		return DateTime.normalize(new Date(Date.parse(this.dom.value)));
	}, function (value) {
		if (value == null) {
			value = null;
			this.dom.value = '';
			this.dom.removeAttribute('value');
		} else {
			value = value.toISOString().slice(0, 16);
			this.dom.value = value;
			this.dom.setAttribute('value', value);
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	}),
	castAttribute: d(function (name, value) {
		if (this.dateAttributes[name] && isDate(value)) {
			this.dom.setAttribute(name, value.toISOString().slice(0, 10));
		} else {
			castAttribute.call(this, name, value);
		}
	})
});

module.exports = Object.defineProperties(DateTime, {
	unserializeDOMInputValue: d(function (value) {
		if (value == null) return null;
		value = Date.parse(value);
		return isNaN(value) ? null : DateTime(value);
	}),
	DOMInput: d(Input),
});
