'use strict';

var copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d/d')
  , DOMInput = require('../string-line').DOMInput

  , Password = require('dbjs/lib/objects')._get('Password')
  , Input;

require('../../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ dirname: false, inputmode: false, list: false })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'password');
	}),
});

module.exports = Object.defineProperty(Password, 'DOMInput', d(Input));
