'use strict';

var partial       = require('es5-ext/lib/Function/prototype/partial')
  , d             = require('es5-ext/lib/Object/descriptor')
  , forEach       = require('es5-ext/lib/Object/for-each')
  , some          = require('es5-ext/lib/Object/some')
  , castAttribute = require('dom-ext/lib/Element/prototype/cast-attribute')
  , elExtend      = require('dom-ext/lib/Element/prototype/extend')
  , Db            = require('dbjs')
  , nextTick      = require('next-tick')
  , DOMInput      = require('./input')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.document = document;
	this.ns = ns;
	this.dom = document.createElement('ul');
	this.dom._dbjsInput = this;
	this.dom.setAttribute('class', 'radio');
	this.items = {};
	this.listItems = {};
	if (options.name) this._name = options.name;
	document.addEventListener('reset',
		partial.call(nextTick, this.onchange.bind(this)), false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	inputAttributes: d({ name: true, required: true, disabled: true }),
	createOption: d(function (value, labelTextDOM) {
		var dom, label, input;
		dom = this.listItems[value] = this.document.createElement('li');
		label = dom.appendChild(this.document.createElement('label'));
		input = this.items[value] =
			label.appendChild(this.document.createElement('input'));
		input._dbjsInput = this;
		input.setAttribute('type', 'radio');
		input.setAttribute('value', value);
		if (this._name) input.setAttribute('name', this._name);
		label.appendChild(this.document.createTextNode(' '));
		elExtend.call(label, labelTextDOM);
		input.addEventListener('change', this.onchange.bind(this), false);
		return dom;
	}),
	name: d.gs(function () { return this._name; }, function (name) {
		this._name = name;
		forEach(this.items, function (input) {
			input.setAttribute('name', name);
		});
	}),
	value: d.gs(function () {
		var selectedValue;
		some(this.items, function (radio) {
			if (radio.checked) {
				selectedValue = radio.value;
				return true;
			}
			return false;
		});
		return (selectedValue == null) ? null : selectedValue;
	}, function (nu) {
		if (nu != null) {
			if (nu.__toString) nu = nu.__toString.__value.call(nu);
			else nu = String(nu);
		} else {
			nu = null;
		}
		forEach(this.items, function (radio, value) {
			if (nu === value) return;
			radio.checked = false;
			radio.removeAttribute('checked');
		});
		if (nu != null) {
			this.items[nu].setAttribute('checked', 'checked');
			this.items[nu].checked = true;
		}
		this._value = nu;
		if (this.changed) this.emit('change:changed', this.changed = false);
	}),
	castAttribute: d(function (name, value) {
		if (this.inputAttributes[name]) {
			forEach(this.items, function (input) {
				castAttribute.call(input, name, value);
			});
			return;
		}
		castAttribute.call(this.dom, name, value);
	})
});

Object.defineProperty(Db.Base, 'DOMRadio', d(Input));
