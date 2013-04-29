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

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.document = document;
	this.ns = ns;
	this.createContainer();
	this.dom._dbjsInput = this;
	this.items = {};
	this.listItems = {};
	if (options.name) this._name = options.name;
	document.addEventListener('reset',
		partial.call(nextTick, this.onchange.bind(this)), false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	inputAttributes: d({ name: true, required: true, disabled: true }),
	createContainer: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.setAttribute('class', 'radio');
	}),
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
	inputValue: d.gs(function () {
		var selectedValue = '';
		some(this.items, function (radio) {
			if (radio.checked) {
				selectedValue = radio.value;
				return true;
			}
			return false;
		});
		return selectedValue;
	}),
	value: d.gs(getValue, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (this._value !== nu) {
			if (this.items.hasOwnProperty(this._value)) {
				this.items[this._value].removeAttribute('checked');
			}
			if (this.items.hasOwnProperty(nu)) {
				this.items[nu].setAttribute('checked', 'checked');
			}
			this._value = nu;
		}
		if (nu !== old) {
			if (this.items.hasOwnProperty(nu)) this.items[nu].checked = true;
			else if (this.items.hasOwnProperty(old)) this.items[old].checked = false;
			this.onchange();
		}
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
