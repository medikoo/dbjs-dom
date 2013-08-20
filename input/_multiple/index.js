'use strict';

var contains      = require('es5-ext/lib/Array/prototype/contains')
  , uniq          = require('es5-ext/lib/Array/prototype/uniq')
  , remove        = require('es5-ext/lib/Array/prototype/remove')
  , k             = require('es5-ext/lib/Function/k')
  , copy          = require('es5-ext/lib/Object/copy')
  , d             = require('es5-ext/lib/Object/descriptor')
  , extend        = require('es5-ext/lib/Object/extend')
  , makeElement   = require('dom-ext/lib/Document/prototype/make-element')
  , castAttribute = require('dom-ext/lib/Element/prototype/cast-attribute')
  , extendEl      = require('dom-ext/lib/Element/prototype/extend')
  , removeEl      = require('dom-ext/lib/Element/prototype/remove')
  , setPresenceEl = require('dom-ext/lib/Element/prototype/set-presence')
  , isAnchor   = require('dom-ext/lib/HTMLAnchorElement/is-html-anchor-element')
  , Base          = require('dbjs').Base
  , serialize     = require('dbjs/lib/utils/serialize')
  , DOMInput      = require('../_controls/input')

  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = copy(Object(arguments[2]));
	this.items = [];
	this.removeButtons = [];
	this.make = makeElement.bind(document);
	delete options.multiple;
	if (options.minInputsCount) {
		this.minInputsCount = options.minInputsCount >>> 0;
		delete options.minInputsCount;
	}
	if (options.addLabel) {
		this.addLabel = options.addLabel;
		delete options.addLabel;
	}
	if (options.deleteLabel) {
		this.deleteLabel = (typeof options.deleteLabel === 'function') ?
				options.deleteLabel : k(options.deleteLabel);
		delete options.deleteLabel;
	}

	this.options = Object(options.item);
	this.options.dbOptions = options.dbOptions;
	this.options.control = Object(this.options.control);
	DOMInput.call(this, document, ns, options);
};

Input.prototype = Object.create(DOMInput.prototype, extend({
	_value: d(null),
	controlAttributes: d({}),
	minInputsCount: d(0),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid;
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
		var length, item;
		if (value == null) value = [];
		this._value = value;
		value.forEach(function (value, index) {
			var item = this.items[index];
			if (!item) item = this.addItem();
			item.index = index;
			item.value = value;
		}, this);

		length = value.length;
		while (this.items[length]) this.removeItem(this.items[length]);
		while (length < this.minInputsCount) {
			item = this.addItem();
			item.index = length++;
		}
	}),
	value: d.gs(function () { return this.inputValue; }, function (value) {
		if (value._type_ === 'relation') {
			this.inputValue = value.values.map(serialize).sort(function (a, b) {
				return value[a].order - value[b].order;
			}).map(function (key) { return value[key]._subject_; });
		} else {
			this.inputValue = value.values;
		}
	}),
	castControlAttribute: d(function (name, value) {
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
	deleteLabel: d(k('x')),
	_render: d(function () {
		var el = this.make;
		this.domList = el('ul');
		this.addButton = this.addLabel;
		if (isAnchor(this.addButton)) {
			castAttribute.call(this.addButton, 'onclick', this.addItem);
		} else {
			this.addButton = el('a', { onclick: this.addItem }, this.addButton);
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
		input = this.ns.toDOMInput(this.document, this.options);
		dom = el('li');
		removeButton = this.deleteLabel();
		if (isAnchor(removeButton)) {
			castAttribute.call(removeButton, 'onclick',
				this.safeRemoveItem.bind(this, input));
		} else {
			removeButton = el('a', { onclick: this.safeRemoveItem.bind(this, input) },
				removeButton);
		}
		extendEl.call(dom, input, removeButton);
		this.removeButtons.push(removeButton);
		if (this.options.control.disabled) {
			setPresenceEl.call(removeButton, false);
		}
		return { dom: dom, input: input };
	}),
}, d.binder({
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
	})
})));

Object.defineProperty(Base, 'DOMMultipleInput', d(Input));
