'use strict';

var noop     = require('es5-ext/function/noop')
  , callable = require('es5-ext/object/valid-callable')
  , d        = require('d/d')
  , DOMInput = require('../_composite')

  , getInputValue =
	Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	options.dbOptions = Object(options.dbOptions);
	this.getValue = callable(options.dbOptions._value_);
	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	name: d.gs(noop, noop),
	inputValue: d.gs(function () {
		var state = getInputValue.call(this);
		return this.getValue.call(state);
	}, noop)
});
