'use strict';

var noop           = require('es5-ext/function/noop')
  , forEach        = require('es5-ext/object/for-each')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , callable       = require('es5-ext/object/valid-callable')
  , d              = require('d')
  , tokenize       = require('dbjs/_setup/utils/resolve-property-path').tokenize
  , isObservable   = require('observable-value/is-observable-value')
  , resolveOptions = require('../utils/resolve-options')
  , DOMInput       = require('../_composite')

  , defineProperty = Object.defineProperty, getPrototypeOf = Object.getPrototypeOf
  , getInputValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , Input;

var observeMock = function (value) { return isObservable(value) ? value.value : value; };

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2], fn, proto;
	this.type = type;
	options = resolveOptions(options, type);
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
	name: d.gs(function () {
		return this._name ? (this._name + this._indexString) : '';
	}, function (name) {
		this._name = name;
		name = this.name;
	}),
	inputValue: d.gs(function () {
		var mock = setPrototypeOf({}, this.observable.object);
		forEach(getInputValue.call(this), function (value, keyPath) {
			var names = tokenize(keyPath), propName = names.pop(), name
			  , obj = mock, dbjsObj = this.observable.object;
			names.shift(); // clear object id=
			while ((name = names.shift())) {
				if (!obj.hasOwnProperty(name)) {
					defineProperty(obj, name, d('cew', {}));
					if (dbjsObj[name]) setPrototypeOf(obj[name], dbjsObj[name]);
				}
				obj = obj[name];
			}
			defineProperty(obj, propName, d('cew', value));
			defineProperty(obj, '_' + propName, d('cew', value));
		});
		return this.getValue.call(mock, observeMock);
	}, noop)
});
