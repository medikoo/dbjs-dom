'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('./_controls/input')

  , DateTime = require('dbjs').DateTime
  , re = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/
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
	castAttribute: d(function (name, value) {
		if (this.dateAttributes[name] && isDate(value)) {
			this.dom.setAttribute(name, this.ns.toInputValue(value));
		} else {
			castAttribute.call(this, name, value);
		}
	})
});

module.exports = Object.defineProperties(DateTime, {
	fromInputValue: d(function (value) {
		var match, args;
		value = value.trim();
		if (!value) return null;
		match = value.match(re);
		if (!match) return null;
		args = [Number(match[1]), Number(match[2]) - 1, Number(match[3]),
			match[4] ? Number(match[4]) : 0, match[5] ? Number(match[5]) : 0];
		if (this.prototype.validateCreate.apply(this.prototype, args)) {
			return null;
		}
		return this.prototype.create.apply(this.prototype, args);
	}),
	toInputValue: d(function (value) {
		return (value == null) ? '' : value.toISOString().slice(0, 16);
	}),
	DOMInput: d(Input),
});
