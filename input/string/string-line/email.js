'use strict';

var copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d/d')
  , DOMInput = require('../string-line').DOMInput

  , Email = require('dbjs/lib/objects')._get('Email')
  , Input;

require('../../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ dirname: false, inputmode: false })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes),
		{ pattern: false })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'email');
	})
});

module.exports = Object.defineProperties(Email, {
	fromInputValue: d(function (value) {
		if (value == null) return null;
		value = value.trim();
		return value ? value.toLowerCase() : null;
	}),
	DOMInput: d(Input)
});
