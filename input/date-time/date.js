'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('../date-time').DOMInput

  , DateType = require('dbjs/lib/objects')._get('Date')
  , setValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').set
  , re = /^(\d{4})-(\d{2})-(\d{2})/
  , Input;

require('../');

Input = function (document, ns/*, options*/) {
	DOMInput.call(this, document, ns, arguments[2]);
	this.dom.setAttribute('type', 'date');
	if (ns.max) this.castAttribute('max', ns.max);
	if (ns.min) this.castAttribute('min', ns.min);
	if (ns.step) this.dom.setAttribute('step', ns.step);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_dateToInputValue: d(function (date) {
		return date.toISOString().slice(0, 10);
	}),
	value: d.gs(function () {
		var value = this.dom.value, match;
		if (!value) return null;
		match = String(value).match(re);
		if (!match) return null;
		value = this.ns.normalize(new Date(Number(match[1]), Number(match[2]) - 1,
			Number(match[3]), 12));
		if (this._value && (value.valueOf() === this._value.valueOf())) {
			return this._value;
		}
		return value;
	}, setValue)
});

module.exports = Object.defineProperties(DateType, {
	DOMInput: d(Input),
});
