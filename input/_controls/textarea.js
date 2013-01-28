'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('./input')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, ns) {
	this.document = document;
	this.ns = ns;
	this.dom = document.createElement('textarea');
	this.dom._dbjsInput = this;
	if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	this.dom.appendChild(document.createTextNode(''));
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	value: d.gs(getValue, function (value) {
		if (value == null) {
			this.dom.value = '';
			this.dom.firstChild.data = '';
		} else {
			if (value.__toString) value = value.__toString.__value.call(value);
			else value = String(value);
			this.dom.value = value;
			this.dom.firstChild.data = value;
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

Object.defineProperty(Db.Base, 'DOMTextarea', d(Input));
