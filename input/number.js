'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('./_controls/input')

  , NumberType = Db.Number
  , Input;

Input = function (document, ns/*, options*/) {
	DOMInput.call(this, document, ns, arguments[2]);
	this.dom.setAttribute('type', 'number');
	if (ns.max < Infinity) this.dom.setAttribute('max', ns.max);
	if (ns.min > -Infinity) this.dom.setAttribute('min', ns.min);
	if (ns.step) this.dom.setAttribute('step', ns.step);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	knownAttributes: d({ class: true, id: true, required: true, style: true,
		placeholder: true }),
	value: d.gs(function () {
		var value = this.dom.value;
		return isNaN(value) ? null : Number(value);
	}, function (value) {
		value = isNaN(value) ? null : Number(value);
		if (value == null) {
			this.dom.value = '';
			this.dom.removeAttribute('value');
		} else {
			this.dom.value = value;
			this.dom.setAttribute('value', value);
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

module.exports = Object.defineProperty(NumberType, 'DOMInput', d(Input));
