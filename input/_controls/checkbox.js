'use strict';

var copy     = require('es5-ext/lib/Object/copy')
  , d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('./input')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input, knownAttributes = copy(DOMInput.prototype.knownAttributes);

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	DOMInput.call(this, document, ns, options);
	this.dom.setAttribute('type', 'checkbox');
	this.dom.setAttribute('value', '1');
	this.dom.addEventListener('change', this.onchange.bind(this), false);
	if (options.forceRequired) this.castAttribute('required', true);
};

delete knownAttributes.required;
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	valid: d(true),
	knownAttributes: d(knownAttributes),
	inputValue: d.gs(function () { return this.control.checked ? '1' : ''; }),
	value: d.gs(getValue, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (this._value !== nu) {
			if (nu === '1') this.control.setAttribute('checked', 'checked');
			else this.control.removeAttribute('checked');
			this._value = nu;
		}
		if (nu !== old) {
			this.control.checked = (nu === '1');
			this.onchange();
		}
	})
});

Object.defineProperty(Db.Base, 'DOMCheckbox', d(Input));
