'use strict';

var contains      = require('es5-ext/array/#/contains')
  , uniq          = require('es5-ext/array/#/uniq')
  , remove        = require('es5-ext/array/#/remove')
  , constant      = require('es5-ext/function/constant')
  , assign        = require('es5-ext/object/assign')
  , Set           = require('es6-set')
  , d             = require('d')
  , autoBind      = require('d/auto-bind')
  , makeElement   = require('dom-ext/document/#/make-element')
  , castAttribute = require('dom-ext/element/#/cast-attribute')
  , extend        = require('dom-ext/element/#/extend')
  , removeEl      = require('dom-ext/element/#/remove')
  , setPresenceEl = require('dom-ext/element/#/set-presence')
  , isAnchor     = require('dom-ext/html-anchor-element/is-html-anchor-element')
  , DOMInput      = require('../_controls/input')

  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2];
	this.items = [];
	this.removeButtons = [];
	this.make = makeElement.bind(document);
	this.type = type;
	options = this._resolveOptions(options);
	delete options.multiple;
	if (options.minInputsCount) {
		this.minInputsCount = options.minInputsCount >>> 0;
		delete options.minInputsCount;
	}
	if (options.addLabel) {
		this.addLabel = (typeof options.addLabel === 'function')
			? options.addLabel() : options.addLabel;
		delete options.addLabel;
	} else if (typeof this.addLabel === 'function') {
		this.addLabel = this.addLabel();
	}
	if (options.deleteLabel) {
		this.deleteLabel = (typeof options.deleteLabel === 'function')
			? options.deleteLabel : constant(options.deleteLabel);
		delete options.deleteLabel;
	}

	this.options = Object(options.item);
	this.options.dbOptions = options.dbOptions;
	this.options.control = Object(this.options.control);
	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, assign({
	constructor: d(Input),
	_value: d(null),
	controlAttributes: d({}),
	minInputsCount: d(0),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid, form;
		if (this.items[0]) {
			form = this.items[0].form;
			if (form) {
				if (this.form !== form) {
					if (this.form) this.form.removeEventListener('reset', this._onReset, false);
					this.form = form;
					this.form.addEventListener('reset', this._onReset, false);
				}
			}
		}
		value = this.value;
		changed = this.items.some(function (item) { return item.changed; });
		valid = this.items.every(function (item) { return item.valid;  });
		if (valid && this.required) valid = Boolean(value.length);

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
	name: d.gs(getName, function (name) {
		this._name = name;
		name = this.name;
		this.items.forEach(function (input) { input.name = name; });
	}),
	inputValue: d.gs(function () {
		return uniq.call(this.items.map(function (item) { return item.value; })
			.filter(function (value) { return value != null; }));
	}, function (value) {
		var length, item, index = -1;
		if (value == null) value = new Set();
		this._value = value;
		value.forEach(function (value) {
			var item = this.items[++index];
			if (!item) item = this.addItem();
			item.index = index;
			item.value = value;
		}, this);

		length = value.size;
		while (this.items[length]) this.removeItem(this.items[length]);
		while (length < this.minInputsCount) {
			item = this.addItem();
			item.index = length++;
		}
	}),
	value: d.gs(function () { return this.inputValue; }, function (value) {
		this.inputValue = value;
	}),
	castControlAttribute: d(function (name, value) {
		if (name === 'required') return;
		this.options.control[name] = value;
		this.items.forEach(function (input) {
			input.castControlAttribute(name, value);
		});
		if (name === 'disabled') {
			if (this.addButton) setPresenceEl.call(this.addButton, !value);
			this.removeButtons.forEach(function (btn) {
				setPresenceEl.call(btn, !value);
			});
		}
	}),
	addLabel: d('Add'),
	deleteLabel: d(constant('x')),
	_render: d(function () {
		var el = this.make;
		this.domList = el('ul');
		this.addButton = this.addLabel;
		if (isAnchor(this.addButton)) {
			castAttribute.call(this.addButton, 'onclick', this.addItem);
		} else {
			this.addButton = el('a', { class: 'dbjs-multiple-button-add', onclick: this.addItem },
				this.addButton);
		}
		this.dom = el('div', { class: 'dbjs multiple' }, this.domList,
			el('div', { class: 'controls' }, this.addButton));
	}),
	safeRemoveItem: d(function (input) {
		if (this.domList.childNodes.length <= this.minInputsCount) return;
		this.removeItem(input);
	}),
	removeItem: d(function (input) {
		if (!contains.call(this.items, input)) return;
		removeEl.call(input.listItem);
		remove.call(this.items, input);
		input.destroy();
		this.items.forEach(function (item, index) { item.index = index; });
		this.onChange();
	}),
	renderItem: d(function () {
		var el = this.make, dom, input, removeButton;
		input = this.type.toDOMInput(this.document, this.options);
		dom = el('li');
		removeButton = this.deleteLabel();
		if (isAnchor(removeButton)) {
			castAttribute.call(removeButton, 'onclick',
				this.safeRemoveItem.bind(this, input));
		} else {
			removeButton = el('a', { class: 'dbjs-multiple-button-remove',
				onclick: this.safeRemoveItem.bind(this, input) },
				removeButton);
		}
		extend.call(dom, input, removeButton);
		this.removeButtons.push(removeButton);
		if (this.options.control.disabled) setPresenceEl.call(removeButton, false);
		return { dom: dom, input: input };
	})
}, autoBind({
	addItem: d(function () {
		var data = this.renderItem(), input = data.input, dom = data.dom;
		if (this.name) input.name = this.name;
		input.index = this.items.length;
		input.parent = this;
		this.items.push(input);
		input.listItem = dom;
		input.on('change', this.onChange);
		this.domList.appendChild(dom);
		this.onChange();
		return input;
	}),
	_onReset: d(function (e) {
		var control = this.dom.getElementsByTagName('input')[0];
		if (!control) control = this.dom.getElementsByTagName('select')[0];
		if (!control) control = this.dom.getElementsByTagName('textarea')[0];
		if (!control) return;
		this.inputValue = this._value;
	})
})));
