'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , DOMInput = require('../../_controls/input')

  , Email = require('dbjs/lib/objects')._get('Email')
  , Input;

require('../../');

Input = function (document, ns) {
	DOMInput.apply(this, arguments);
	this.dom.setAttribute('type', 'email');
	if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
};
Input.prototype = Object.create(DOMInput.prototype, { constructor: d(Input) });

module.exports = Object.defineProperty(Email, 'DOMInput', d(Input));
