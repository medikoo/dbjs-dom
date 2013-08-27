'use strict';

var noop     = require('es5-ext/function/noop')
  , d        = require('es5-ext/object/descriptor')
  , callable = require('es5-ext/object/valid-callable')
  , Db       = require('dbjs')
  , DOMInput = require('../_composite')

  , getInputValue =
	Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	options.dbOptions = Object(options.dbOptions);
	this.getValue = callable(options.dbOptions._value);
	DOMInput.call(this, document, ns, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	name: d.gs(noop, noop),
	inputValue: d.gs(function () {
		var state = getInputValue.call(this);
		state.Db = Db;
		return this.getValue.call(state);
	}, noop)
});
