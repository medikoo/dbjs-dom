'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('../../_controls/input')

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
	htmlAttributes: d({ class: true, id: true, required: true, style: true,
		placeholder: true })
});

module.exports = Object.defineProperties(Email, {
	fromInputValue: d(function (value) {
		value = value.trim();
		return value ? value.toLowerCase() : null;
	}),
	DOMInput: d(Input)
});
