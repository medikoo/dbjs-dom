'use strict';

var copy     = require('es5-ext/object/copy')
  , d        = require('es5-ext/object/descriptor')
  , extend   = require('es5-ext/object/extend')
  , DOMInput = require('../string-line').DOMInput

  , Email = require('dbjs/lib/objects')._get('Email')
  , Input;

require('../../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ dirname: false, inputmode: false })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
		{ pattern: false })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'email');
	}),
});

module.exports = Object.defineProperties(Email, {
	fromInputValue: d(function (value) {
		if (value == null) return null;
		value = value.trim();
		return value ? value.toLowerCase() : null;
	}),
	DOMInput: d(Input)
});
