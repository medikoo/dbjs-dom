'use strict';

var noop             = require('es5-ext/function/noop')
  , assign           = require('es5-ext/object/assign')
  , map              = require('es5-ext/object/map')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , some             = require('es5-ext/object/some')
  , d                = require('d')
  , makeElement      = require('dom-ext/document/#/make-element')
  , resolveOptions   = require('./utils/resolve-options')
  , DOMInput         = require('./_controls/input')

  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2];
	this.items = {};
	this.type = type;
	options = resolveOptions(options, type);
	this.options = Object(options.item);
	if (options.required != null) this.options.required = options.required;
	this.options.control = assign(Object(options.control),
		Object(this.options.control));
	this.customOptions = Object(options.items);
	this.make = makeElement.bind(document);
	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_value: d(null),
	isComposite: d(true),
	controlAttributes: d({}),
	_render: d(function () { throw new Error("Not implemented"); }),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid, isRequired;
		value = this.value;
		changed = some(this.items, function (item) { return item.changed; });
		if (this.required) isRequired = true;
		else if (this.observable) isRequired = this.observable.descriptor.required;
		valid = isRequired ? (value != null) : true;

		if (this.changed !== changed) {
			this.changed = changed;
			emitChanged = true;
		}
		if (this.valid !== valid) {
			this.valid = valid;
			emitValid = true;
		}

		this.emit('change', value);
		if (emitChanged) this.emit('change:changed', this.changed);
		if (emitValid) this.emit('change:valid', this.valid);
	}),
	inputValue: d.gs(function () {
		return map(this.items, function (input) { return input.value; });
	}, noop),
	value: d.gs(function () { return this.inputValue; }, noop),
	castControlAttribute: d(noop),
	getOptions: d(function (desc) {
		var options = [this.options], object = desc.object, sKey = desc._sKey_;
		while (true) {
			if (this.customOptions[sKey]) options.push(this.customOptions[sKey]);
			if (!object.owner) break;
			sKey = object.__sKey__ + '/' + sKey;
			object = object.owner;
		}
		if (this.customOptions[desc.__valueId__]) options.push(this.customOptions[desc.__valueId__]);
		return normalizeOptions.apply(null, options);
	}),
	addItem: d(function (input, name) {
		this.items[name] = input;
		input.parent = this;
		input.on('change', this.onChange);
		return input;
	})
});
