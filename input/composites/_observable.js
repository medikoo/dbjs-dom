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
	var options = arguments[2];

	this.type = type;
	options = resolveOptions(options, type);
	options.dbOptions = Object(options.dbOptions);
	this._initialize(options);

	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_initialize: d(function (options) {
		var proto = options.dbOptions
		  , fn    = proto._value_;

		while ((fn !== undefined) && (typeof fn !== 'function')) {
			proto = getPrototypeOf(proto);
			fn = proto._value_;
		}

		this.getValue = callable(fn);
	}),
	name: d.gs(function () {
		return this._name ? (this._name + this._indexString) : '';
	}, function (name) {
		this._name = name;
		name = this.name;
	}),
	inputValue: d.gs(function () {
		var mock = setPrototypeOf({}, this.observable.object.master), context = mock
		  , path, current, dbjsObj;
		forEach(getInputValue.call(this), function (value, keyPath) {
			var names = tokenize(keyPath.slice()), propName = names.pop(), name
			  , obj = mock, dbjsObj = this.observable.object.master;
			names.shift(); // clear object id
			while ((name = names.shift())) {
				if (!obj.hasOwnProperty(name)) {
					defineProperty(obj, name, d('cew', {}));
					if (dbjsObj[name]) {
						setPrototypeOf(obj[name], dbjsObj[name]);
						defineProperty(obj[name], 'owner', d('cew', obj));
						defineProperty(obj[name], 'master', d('cew', mock));
						dbjsObj = dbjsObj[name];
					}
				}
				obj = obj[name];
			}
			defineProperty(obj, propName, d('cew', value));
			defineProperty(obj, '_' + propName, d('cew', value));
		}, this);
		if (this.observable.object !== this.observable.object.master) {
			path = [];
			current = this.observable.object;
			while (current && (current !== this.observable.object.master)) {
				path.push(current.key);
				current = current.owner;
			}
			dbjsObj = this.observable.object.master;
			path.reverse().forEach(function (name) {
				if (!context.hasOwnProperty(name)) {
					defineProperty(context, name, d('cew', {}));
					if (dbjsObj[name]) {
						setPrototypeOf(context[name], dbjsObj[name]);
						dbjsObj = dbjsObj[name];
					}
				}
				context = context[name];
			});
		}
		return this.getValue.call(context, observeMock);
	}, noop)
});
