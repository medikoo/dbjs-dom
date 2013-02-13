'use strict';

var contains     = require('es5-ext/lib/Array/prototype/contains')
  , diff         = require('es5-ext/lib/Array/prototype/diff')
  , isUniq       = require('es5-ext/lib/Array/prototype/is-uniq')
  , remove       = require('es5-ext/lib/Array/prototype/remove')
  , copy         = require('es5-ext/lib/Object/copy')
  , d            = require('es5-ext/lib/Object/descriptor')
  , extend       = require('es5-ext/lib/Object/extend')
  , ee           = require('event-emitter/lib/core')
  , makeElement  = require('dom-ext/lib/Document/prototype/make-element')
  , extendEl     = require('dom-ext/lib/Element/prototype/extend')
  , removeEl     = require('dom-ext/lib/Element/prototype/remove')
  , nextTickOnce = require('next-tick/lib/once')
  , Base         = require('dbjs').Base

  , forEach = Array.prototype.forEach
  , Input, propagate;

propagate = function (name) {
	var props = {};
	forEach.call(arguments, function (name) {
		props[name] = d(function () {
			var args = arguments;
			this.items.forEach(function (input) { input[name].apply(input, args); });
		});
	});
	return props;
};

module.exports = Input = function (document, ns/*, options*/) {
	this.document = document;
	this.ns = ns;
	this._value = [];
	this.options = copy(Object(arguments[2]));
	delete this.options.multiple;
	if (this.options.name) {
		this._name = this.options.name;
		delete this.options.name;
	}
	this.onchange = nextTickOnce(this.onchange.bind(this));
	this.make = makeElement.bind(document);
	this.items = [];
	this.render();
};

ee(Object.defineProperties(Input.prototype, extend({
	_value: d(null),
	changed: d(false),
	requried: d(false),
	valid: d(false),
	onchange: d(function () {
		var value = this.value, changedChanged, isValid;
		if ((value.length !== this._value.length) ||
				diff.call(this._value, value).length) {
			if (!this.changed) {
				this.changed = true;
				changedChanged = true;
			}
		} else if (this.changed) {
			this.changed = false;
			changedChanged = true;
		}
		this.emit('change');
		if (changedChanged) this.emit('change:changed', this.changed);
		if (this.required && !value.length) isValid = false;
		else if (contains.call(value, null)) isValid = false;
		else isValid = isUniq.call(value);
		if (this.valid === isValid) return;
		this.emit('change:valid', this.valid = !this.valid);
	}),
	name: d.gs(function () { return this._name; }, function (name) {
		this._name = name;
		this.items.forEach(function (input) { input.name = name; });
	}),
	value: d.gs(function () {
		return this.items.map(function (item) { return item.value; });
	}, function (value) {
		var length;
		if (value._isSet_) value = value.values;
		value.forEach(function (value, index) {
			var item = this.items[index];
			if (!item) item = this.addEmpty();
			item.value = value;
		}, this);
		length = value.length;
		while (this.items[length]) this.removeItem(this.items[length]);
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	}),
	render: d(function () {
		var el = this.make;
		this.domList = el('ul');
		this.dom = el('div', { class: 'dbjs multiple' }, this.domList,
			el('div', { class: 'controls' },
				el('a', { onclick: this.addEmpty }, 'Add')));
	}),
	renderItem: d(function (input) {
		var el = this.make, dom;
		this.items.push(input);
		input.parent = this;
		if (this._name) input.name = this._name;
		dom = el('li');
		extendEl.call(dom, input,
				el('a', { onclick: this.removeItem.bind(this, input) }, 'x'));
		input.on('change', this.onchange);
		this.onchange();
		return this.domList.appendChild(dom);
	}),
	removeItem: d(function (input) {
		if (!contains.call(this.items, input)) return;
		removeEl.call(input.dom.parentNode);
		remove.call(this.items, input);
		this.onchange();
	}),
	toDOM: d(function () { return this.dom; })
}, propagate('castAttribute', 'castKnownAttributes'), d.binder({
	addEmpty: d(function () {
		var item = this.ns.toDOMInput(this.document, this.options);
		this.renderItem(item);
		return item;
	})
}))));

Object.defineProperty(Base, 'DOMMultipleInput', d(Input));
