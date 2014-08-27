'use strict';

var noop     = require('es5-ext/function/noop')
  , callable = require('es5-ext/object/valid-callable')
  , d        = require('d')
  , DOMInput = require('../_composite')

  , getPrototypeOf = Object.getPrototypeOf
  , getInputValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2], fn, proto;
	this.type = type;
	options = this._resolveOptions(options);
	options.dbOptions = Object(options.dbOptions);
	proto = options.dbOptions;
	fn = proto._value_;
	while ((fn !== undefined) && (typeof fn !== 'function')) {
		proto = getPrototypeOf(proto);
		fn = proto._value_;
	}
	this.getValue = callable(fn);
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
