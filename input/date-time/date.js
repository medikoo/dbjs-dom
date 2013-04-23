'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('../date-time').DOMInput

  , DateType = require('dbjs/lib/objects')._get('Date')
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
	})
});

module.exports = Object.defineProperties(DateType, {
	DOMInput: d(Input),
});
