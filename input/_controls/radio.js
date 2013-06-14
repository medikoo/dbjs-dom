'use strict';

var copy        = require('es5-ext/lib/Object/copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , extend      = require('es5-ext/lib/Object/extend')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , some        = require('es5-ext/lib/Object/some')
  , isRegExp    = require('es5-ext/lib/RegExp/is-reg-exp')
  , startsWith  = require('es5-ext/lib/String/prototype/starts-with')
  , castAttr    = require('dom-ext/lib/Element/prototype/cast-attribute')
  , mergeClass  = require('dom-ext/lib/HTMLElement/prototype/merge-class')
  , dispatchEvt = require('dom-ext/lib/HTMLElement/prototype/dispatch-event-2')
  , elExtend    = require('dom-ext/lib/Element/prototype/extend')
  , Db          = require('dbjs')
  , DOMInput    = require('./input')
  , htmlAttrs   = require('../_html-attributes')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	this.controls = this.items = {};
	this.listItems = {};
	this.attributes = {};
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_value: d(null),
	constructor: d(Input),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ required: true })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
		{ required: true })),
	_render: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.setAttribute('class', 'radio');
	}),
	name: d.gs(getName, function (name) {
		this._name = name;
		name = this.name;
		forEach(this.controls, function (input) {
			if (name) input.setAttribute('name', name);
			else input.removeAttribute('name');
		});
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
		if (this.name) input.setAttribute('name', this.name);
		forEach(this.attributes, function (value, name) {
			castAttr.call(input, name, value);
		}, this);
		label.appendChild(this.document.createTextNode(' '));
		elExtend.call(label, labelTextDOM);
		input.addEventListener('change', this.onChange, false);
		return dom;
	}),
	castControlAttribute: d(function (name, value) {
		if (!this.controlAttributes[name] && !htmlAttrs[name] &&
				!startsWith.call(name, 'data-')) {
			return;
		}
		if (isRegExp(value)) value = value.source.slice(1, -1);
		this.attributes[name] = value;
		forEach(this.controls, function (input) {
			if (name === 'class') mergeClass.call(input, value);
			else castAttr.call(input, name, value);
		});
	}),
	inputValue: d.gs(function () {
		var selectedValue = null;
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
			if ((this._value != null) && this.items.hasOwnProperty(this._value)) {
				this.items[this._value].removeAttribute('checked');
			}
			if ((nu != null) && this.items.hasOwnProperty(nu)) {
				this.items[nu].setAttribute('checked', 'checked');
			}
			this._value = nu;
		}
		if (nu !== old) {
			if ((nu != null) && this.items.hasOwnProperty(nu)) {
				this.items[nu].checked = true;
				try { dispatchEvt.call(this.items[nu], 'change'); } catch (e) {}
			} else if ((old != null) && this.items.hasOwnProperty(old)) {
				this.items[old].checked = false;
				try { dispatchEvt.call(this.items[old], 'change'); } catch (e2) {}
			}
		} else {
			this.onChange();
		}
	})
});

Object.defineProperty(Db.Base, 'DOMRadio', d(Input));
