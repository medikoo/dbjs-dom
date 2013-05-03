'use strict';

var partial        = require('es5-ext/lib/Function/prototype/partial')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , isRegExp       = require('es5-ext/lib/RegExp/is-reg-exp')
  , startsWith     = require('es5-ext/lib/String/prototype/starts-with')
  , ee             = require('event-emitter/lib/core')
  , castAttribute  = require('dom-ext/lib/Element/prototype/cast-attribute')
  , mergeClass     = require('dom-ext/lib/HTMLElement/prototype/merge-class')
  , nextTick       = require('next-tick')
  , Db             = require('dbjs')
  , htmlAttributes = require('../_html-attributes')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.document = document;
	this.ns = ns;
	this._render(options);
	this.dom._dbjsInput = this;
	if (options.name) this.name = options.name;
	options.dbOptions = Object(options.dbOptions);
	if (options.dbOptions.required) this.required = true;
	forEach(this.dbAttributes, function (name, dbName) {
		var value;
		if (!name) return;
		if (name === true) name = dbName;
		if (options[name] != null) return;
		if (options.dbOptions[dbName] != null) value = options.dbOptions[dbName];
		else if (ns[dbName] != null) value = ns[dbName];
		else return;
		this.castControlAttribute(name, value);
	}, this);
	forEach(options, function (value, name) {
		if (name === 'class') {
			mergeClass.call(this.dom, value);
		} else if (htmlAttributes[name] || startsWith.call(name, 'data-')) {
			castAttribute.call(this.dom, name, value);
		} else if (name === 'control') {
			forEach(value, function (value, name) {
				this.castControlAttribute(name, value);
			}, this);
		} else {
			this.castControlAttribute(name, value);
		}
	}, this);
	document.addEventListener('reset',
		this._resetListener = partial.call(nextTick, this.onChange),
		false);
	this.onChange();
};

ee(Object.defineProperties(Input.prototype, extend({
	_value: d(''),
	_name: d(''),
	controlAttributes: d({ autofocus: true, disabled: true, tabindex: true }),
	dbAttributes: d({}),
	changed: d(false),
	_required: d(false),
	valid: d(false),
	_render: d(function () {
		this.control = this.dom = this.document.createElement('input');
	}),
	name: d.gs(function () {
		return this._name ? (this._name + this._indexString) : '';
	}, function (name) {
		this._name = name;
		name = this.name;
		if (name) this.control.setAttribute('name', name);
		else this.control.removeAttribute('name');
	}),
	_index: d(null),
	_indexString: d.gs(function () {
		return (this._index == null) ? '' : '[' + this._index + ']';
	}),
	index: d.gs(function () { return this._index; }, function (index) {
		index = (index == null) ? null : (index >>> 0);
		if (index === this._index) return;
		this._index = index;
		this.name = this._name;
	}),
	required: d.gs(function () { return this._required; }, function (value) {
		value = Boolean(value);
		if (this._required === value) return;
		this._required = value;
		this.castControlAttribute('required', value);
		this.onChange();
		this.emit('change:required', value);
	}),
	toDOM: d(function () { return this.dom; }),
	inputValue: d.gs(function () { return this.control.value; }),
	value: d.gs(function () {
		return this.ns.fromInputValue(this.inputValue);
	}, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (nu == null) nu = '';
		if (this._value !== nu) {
			this.control.setAttribute('value', this._value = nu);
		}
		if (nu !== old) this.control.value = nu;
		this.onChange();
	}),
	castControlAttribute: d(function (name, value) {
		if (name === 'class') {
			mergeClass.call(this.control, value);
		} else if (!this.controlAttributes[name] && !htmlAttributes[name] &&
				!startsWith.call(name, 'data-')) {
			return;
		}
		if (isRegExp(value)) value = value.source.slice(1, -1);
		castAttribute.call(this.control, name, value);
	}),
	destroy: d(function () {
		this.document.removeEventListener('reset', this._resetListener, false);
		this.emit('destroy');
	})
}, d.binder({
	onChange: d(function () {
		var value, inputValue, changed, valid, emitChanged, emitValid;
		inputValue = this.inputValue;
		value = this.value;
		changed = (inputValue !== this._value);
		if (value != null) valid = true;
		else if (this.required) valid = false;
		else valid = ((inputValue == null) || !inputValue.trim());

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
	})
}))));

Object.defineProperty(Db.Base, 'DOMInput', d(Input));
