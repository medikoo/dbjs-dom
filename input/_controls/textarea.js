'use strict';

var partial  = require('es5-ext/lib/Function/prototype/partial')
  , d        = require('es5-ext/lib/Object/descriptor')
  , extend   = require('es5-ext/lib/Object/extend')
  , Db       = require('dbjs')
  , nextTick = require('next-tick')
  , DOMInput = require('./input')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.document = document;
	this.ns = ns;
	this.control = this.dom = document.createElement('textarea');
	if (options.name) this.name = options.name;
	if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	this.dom.appendChild(document.createTextNode(''));
	document.addEventListener('reset',
		partial.call(nextTick, this.onchange.bind(this)), false);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
	this.castHtmlAttributes(options);
	this.dom._dbjsInput = this;
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	htmlAttributes: d(extend({ rows: true, cols: true },
		DOMInput.prototype.htmlAttributes)),
	value: d.gs(getValue, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (this._value !== nu) this.control.firstChild.data = this._value = nu;
		if (nu !== old) {
			this.control.value = nu;
			this.onchange();
		}
	})
});

Object.defineProperty(Db.Base, 'DOMTextarea', d(Input));
