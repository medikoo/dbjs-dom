'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('../../_controls/input')

  , Password = require('dbjs/lib/objects')._get('Password')
  , Input;

require('../../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
	this.dom.setAttribute('type', 'password');
	if (ns.pattern) {
		this.dom.setAttribute('pattern', ns.pattern.source.slice(1, -1));
	}
	if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	knownAttributes: d({ class: true, id: true, required: true, style: true,
		placeholder: true })
});

module.exports = Object.defineProperty(Password, 'DOMInput', d(Input));
