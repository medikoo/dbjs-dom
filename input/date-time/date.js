'use strict';

var d        = require('d/d')
  , DOMInput = require('../date-time').DOMInput

  , DateType = require('dbjs/lib/objects')._get('Date')
  , Input;

require('../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'date');
	}),
});

module.exports = Object.defineProperties(DateType, {
	toInputValue: d(function (value) {
		return (value == null) ? null : value.toISOString().slice(0, 10);
	}),
	DOMInput: d(Input),
});
