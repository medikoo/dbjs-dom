'use strict';

var clear          = require('es5-ext/array/#/clear')
  , callable       = require('es5-ext/object/valid-callable')
  , assign         = require('es5-ext/object/assign')
  , normalizeOpts  = require('es5-ext/object/normalize-options')
  , Set            = require('es6-set')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , lazy           = require('d/lazy')
  , memoizeMethods = require('memoizee/methods-plain')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , DOMCheckbox    = require('../_controls/checkbox')
  , toIdent        = require('../utils/to-ident')
  , DOMInput       = require('./')

  , map = Array.prototype.map
  , notSupported = function () { throw new Error('Not supported'); }

  , DOMMultiple;

module.exports = DOMMultiple = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	DOMInput.call(this, document, type, options);
	this.itemOptions = Object(options.items);
	if (options.renderItem !== undefined) this.customRenderItem = callable(options.renderItem);
	this.listItemIdPrefix = options.listItemIdPrefix;
	this.allItems = [];
	this.itemsByValue = {};
	this.reload();
};

DOMMultiple.prototype = Object.create(DOMInput.prototype, assign({
	constructor: d(DOMMultiple),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid, isRequired;
		value = this.value;
		changed = this.items.some(function (item) { return item.changed; });
		if (this.required) isRequired = true;
		else if (this.observable) isRequired = this.observable.descriptor.required;
		valid = isRequired ? Boolean(value.length) : true;

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
		return this.items.map(function (item) { return item.value; }).filter(Boolean);
	}, function (value) {
		if (value == null) value = new Set();
		this._value = value;
		this.allItems.forEach(function (item) {
			var obj = this.type.fromInputValue(item.control.value);
			item.value = value.has(obj) ? obj : null;
		}, this);
		this.onChange();
	}),
	_render: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.className = 'dbjs multiple checkbox';
	}),
	safeRemoveItem: d(notSupported),
	addItem: d(notSupported),
	removeItem: d(notSupported)
}, lazy({
	markEmpty: d(function () {
		return this.make('input', { type: 'hidden', value: '', name: this.name });
	})
}), autoBind({
	reload: d(function () {
		clear.call(this.items);
		replaceContent.call(this.dom, map.call(this.dbList, function (item) {
			var data = this.renderItem(item.value, item.label);
			this.items.push(data.input);
			return data.dom;
		}, this), this.markEmpty);
		this.items.push(this.markEmpty);
	})
}), memoizeMethods({
	renderItem: d(function (value, label) {
		var el = this.make, input, dom, options, itemAttrs;
		options = this.itemOptions[value]
			? normalizeOpts(this.options, this.itemOptions[value]) : this.options;
		input = new DOMCheckbox(this.document, this.type, options);
		if (this.customRenderItem) {
			dom = this.customRenderItem(input, label, value);
			if (this.listItemIdPrefix) dom.id = this.listItemIdPrefix + toIdent(value);
		} else {
			if (this.listItemIdPrefix) itemAttrs = { id: this.listItemIdPrefix + toIdent(value) };
			dom = el('li', itemAttrs, el('label', input, " ", label));
		}

		if (this.name) input.name = this.name;
		input.parent = this;
		input.listItem = dom;
		input.control.setAttribute('value', value);
		input.on('change', this.onChange);
		this.allItems.push(input);
		this.itemsByValue[value] = input;
		return { dom: dom, input: input };
	})
})));
