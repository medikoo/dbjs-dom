'use strict';

var clear          = require('es5-ext/array/#/clear')
  , assign         = require('es5-ext/object/assign-multiple')
  , d              = require('d/d')
  , autoBind       = require('d/auto-bind')
  , memoize        = require('memoizee/lib/primitive')
  , memDesc        = require('memoizee/lib/d')(memoize)
  , replaceContent = require('dom-ext/element/#/replace-content')
  , DOMCheckbox    = require('../_controls/checkbox')
  , DOMInput       = require('./')

  , map = Array.prototype.map
  , notSupported = function () { throw new Error('Not supported'); }

  , DOMMultiple;

module.exports = DOMMultiple = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
	this.allItems = [];
	this.reload();
};

DOMMultiple.prototype = Object.create(DOMInput.prototype, assign({
	constructor: d(DOMMultiple),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid;
		value = this.value;
		changed = this.items.some(function (item) { return item.changed; });
		valid = this.required ? Boolean(value.length) : true;

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
		return this.items.map(function (item) { return item.value; })
			.filter(function (value) { return value != null; });
	}, function (value) {
		if (value == null) value = [];
		this._value = value;
		this.allItems.forEach(function (item) {
			var obj = this.type.fromInputValue(item.control.value);
			item.value = value.has(obj) ? obj : null;
		}, this);
		this.onChange();
	}),
	_render: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.className = 'dbjs multiple';
	}),
	safeRemoveItem: d(notSupported),
	addItem: d(notSupported),
	removeItem: d(notSupported)
}, autoBind({
	reload: d(function () {
		clear.call(this.items);
		replaceContent.call(this.dom, map.call(this.dbList, function (item) {
			var data = this.renderItem(item.value, item.label);
			this.items.push(data.input);
			return data.dom;
		}, this));
	})
}), memDesc({
	renderItem: d(function (value, label) {
		var el = this.make, input, dom;
		input = new DOMCheckbox(this.document, this.type, this.options);
		dom = el('li', el('label', input, ' ', label));

		if (this.name) input.name = this.name;
		input.parent = this;
		input.listItem = dom;
		input.control.setAttribute('value', value);
		input.on('change', this.onChange);
		this.allItems.push(input);
		return { dom: dom, input: input };
	}, { length: 1 })
})));
