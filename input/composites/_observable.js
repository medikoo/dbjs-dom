'use strict';

var last     = require('es5-ext/array/#/last')
  , noop     = require('es5-ext/function/noop')
  , mapKeys  = require('es5-ext/object/map-keys')
  , callable = require('es5-ext/object/valid-callable')
  , d        = require('d')
  , splitId  = require('dbjs/_setup/unserialize/id')
  , DOMInput = require('../_composite')

  , getPrototypeOf = Object.getPrototypeOf
  , getInputValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , mapKey = function (id) { return last.call(splitId(id)); }
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
		var state = mapKeys(getInputValue.call(this), mapKey);
		if (!state.database) state.database = this.type.database;
		return this.getValue.call(state);
	}, noop)
});
