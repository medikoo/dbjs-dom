'use strict';

var noop        = require('es5-ext/function/noop')
  , copy        = require('es5-ext/object/copy')
  , assign      = require('es5-ext/object/assign')
  , every       = require('es5-ext/object/every')
  , map         = require('es5-ext/object/map')
  , some        = require('es5-ext/object/some')
  , d           = require('d/d')
  , makeElement = require('dom-ext/document/#/make-element')
  , Db          = require('dbjs')
  , DOMInput    = require('./_controls/input')

  , Base = Db.Base
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.items = {};
	this.options = Object(options.item);
	this.options.control = assign(Object(options.control),
		Object(this.options.control));
	this.customOptions = Object(options.items);
	this.make = makeElement.bind(document);
	DOMInput.call(this, document, ns, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_value: d(null),
	isComposite: d(true),
	controlAttributes: d({}),
	_render: d(function () { throw new Error("Not implemented"); }),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid;
		value = this.value;
		changed = some(this.items, function (item) { return item.changed; });
		valid = every(this.items, function (item) { return item.valid; });
		if (valid && this.required) valid = (value != null);

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
	getOptions: d(function (rel) {
		var options = copy(this.options);
		if (this.customOptions[rel.name]) {
			assign(options, this.customOptions[rel.name]);
		}
		if (this.customOptions[rel._id_]) {
			assign(options, this.customOptions[rel._id_]);
		}
		return options;
	}),
	addItem: d(function (input, name) {
		this.items[name] = input;
		input.parent = this;
		input.on('change', this.onChange);
		return input;
	})
});

Object.defineProperty(Base, 'DOMInputComposite', d(Input));
