'use strict';

var contains         = require('es5-ext/array/#/contains')
  , uniq             = require('es5-ext/array/#/uniq')
  , remove           = require('es5-ext/array/#/remove')
  , constant         = require('es5-ext/function/constant')
  , assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , Set              = require('es6-set')
  , d                = require('d')
  , autoBind         = require('d/auto-bind')
  , makeElement      = require('dom-ext/document/#/make-element')
  , extend           = require('dom-ext/element/#/extend')
  , removeEl         = require('dom-ext/element/#/remove')
  , setPresenceEl    = require('dom-ext/element/#/set-presence')
  , getId            = require('dom-ext/html-element/#/get-id')
  , isAnchor         = require('dom-ext/html-anchor-element/is-html-anchor-element')
  , resolveOptions   = require('../utils/resolve-options')
  , DOMInput         = require('../_controls/input')

  , stringify = JSON.stringify
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2];
	this.items = [];
	this.removeButtons = [];
	this.make = makeElement.bind(document);
	this.type = type;
	options = resolveOptions(options, type);
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

	this.options = normalizeOptions(options.item);
	this.options.required = false;
	this.options.dbOptions = options.dbOptions;
	this.options.control = Object(this.options.control);
	this.options.toDOMInput = (typeof options.toDOMInput === 'function') && options.toDOMInput;
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
		var length, item, index = -1, nestedMap;
		if (value == null) {
			value = new Set();
		} else if ((value.key === 'map') && value.owner && this.type.database.NestedMap &&
				(value.owner instanceof this.type.database.NestedMap)) {
			nestedMap = value.owner;
			value = nestedMap.ordered;
		}
		this._value = value;
		value.forEach(function (value) {
			var item = this.items[++index], hiddenInput;
			if (!item) item = this.addItem();
			if (nestedMap) {
				hiddenInput = this.document.createElement('input');
				hiddenInput.type = 'hidden';
				hiddenInput.name = nestedMap.map.__id__ + '[]';
				hiddenInput.value = value.__id__;
				item.dom.appendChild(hiddenInput);
			}
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
		if (this.templateInput) this.templateInput.castControlAttribute(name, value);
		if (name === 'disabled') {
			if (this.addButton) setPresenceEl.call(this.addButton, !value);
			this.removeButtons.forEach(function (btn) {
				setPresenceEl.call(btn, !value);
			});
		}
	}),
	addLabel: d('Add'),
	deleteLabel: d(constant('x')),
	_render: d(function (/*options*/) {
		var el = this.make, options = Object(arguments[0]), templateItem, templateDom;
		this.domList = el('ul');
		this.addButton = this.addLabel;
		templateItem = this.renderItem();
		this.templateInput = templateItem.input;
		templateItem.input.name = options.name;
		templateItem.input.index = true;
		templateDom = el('ul', { class: 'template' }, templateItem.dom);
		if (!isAnchor(this.addButton)) {
			this.addButton = el('a', { class: 'dbjs-multiple-button-add' }, this.addButton);
		}
		this.addButton.setAttribute('onclick', 'document.getElementById(' +
			stringify(getId.call(this.domList)) + ').appendChild(document.getElementById(' +
			stringify(getId.call(templateDom)) + ').firstChild.cloneNode(true));' +
			'this.className = this.className');
		this.addButton.onclick = this.addItem;
		this.dom = el('div', { class: 'dbjs multiple' }, this.domList,
			el('div', { class: 'controls' }, this.addButton), templateDom);
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
		if (this.options.toDOMInput) {
			input = this.options.toDOMInput.call(this.type, this.document, this.options);
		} else {
			input = this.type.toDOMInput(this.document, this.options);
		}
		dom = el('li');
		removeButton = this.deleteLabel();
		if (!isAnchor(removeButton)) {
			removeButton = el('a', { class: 'dbjs-multiple-button-remove' }, removeButton);
		}
		removeButton.setAttribute('onclick', 'this.parentNode.parentNode.removeChild(this.parentNode)');
		removeButton.onclick = this.safeRemoveItem.bind(this, input);
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
