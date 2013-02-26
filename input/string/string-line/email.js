'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('../../_controls/input')

  , valueSet = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').set
  , Email = require('dbjs/lib/objects')._get('Email')
  , Input;

require('../../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
	this.dom.setAttribute('type', 'email');
	if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	knownAttributes: d({ class: true, id: true, required: true, style: true,
		placeholder: true }),
	value: d.gs(function () {
		var value = this.dom.value.trim().toLowerCase();
		return (value === '') ? null : value;
	}, valueSet)
});

module.exports = Object.defineProperty(Email, 'DOMInput', d(Input));
