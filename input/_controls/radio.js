'use strict';

var copy        = require('es5-ext/object/copy')
  , extend      = require('es5-ext/object/extend')
  , forEach     = require('es5-ext/object/for-each')
  , some        = require('es5-ext/object/some')
  , isRegExp    = require('es5-ext/reg-exp/is-reg-exp')
  , startsWith  = require('es5-ext/string/#/starts-with')
  , d           = require('d/d')
  , autoBind    = require('d/auto-bind')
  , castAttr    = require('dom-ext/element/#/cast-attribute')
  , mergeClass  = require('dom-ext/html-element/#/merge-class')
  , dispatchEvt = require('dom-ext/html-element/#/dispatch-event-2')
  , elExtend    = require('dom-ext/element/#/extend')
  , Db          = require('dbjs')
  , DOMInput    = require('./input')
  , htmlAttrs   = require('../_html-attributes')
  , eventOpts   = require('../_event-options')

  , keys = Object.keys
  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	this.controls = this.items = {};
	this.listItems = {};
	this.attributes = {};
	DOMInput.apply(this, arguments);
	document.addEventListener('reset', this._onReset, false);
};

Input.prototype = Object.create(DOMInput.prototype, extend({
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
	}, function (nu) {
		var old = this.inputValue;
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
				try {
					dispatchEvt.call(this.items[nu], 'change', eventOpts);
				} catch (ignore) {}
			} else if ((old != null) && this.items.hasOwnProperty(old)) {
				this.items[old].checked = false;
				try {
					dispatchEvt.call(this.items[old], 'change', eventOpts);
				} catch (ignore) {}
			}
		} else {
			this.onChange();
		}
	}),
	value: d.gs(getValue, function (value) {
		this.inputValue = this.ns.toInputValue(value);
	})
}, autoBind({
	_onReset: d(function (e) {
		var key = keys(this.controls)[0], control;
		if (!key) return;
		control = this.controls[key];
		if (e.target !== control.form) return;
		this.inputValue = this._value;
	})
})));

Object.defineProperty(Db.Base, 'DOMRadio', d(Input));
