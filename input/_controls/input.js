'use strict';

var assign       = require('es5-ext/object/assign')
  , forEach      = require('es5-ext/object/for-each')
  , isRegExp     = require('es5-ext/reg-exp/is-reg-exp')
  , startsWith   = require('es5-ext/string/#/starts-with')
  , d            = require('d/d')
  , autoBind     = require('d/auto-bind')
  , ee           = require('event-emitter/lib/core')
  , castAttr     = require('dom-ext/element/#/cast-attribute')
  , dispatchEvt  = require('dom-ext/html-element/#/dispatch-event-2')
  , mergeClass   = require('dom-ext/html-element/#/merge-class')
  , nextTickOnce = require('next-tick/lib/once')
  , htmlAttrs    = require('../_html-attributes')
  , eventOpts    = require('../_event-options')

  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = Object(arguments[2]), onChange = this.onChange.bind(this);
	this.document = document;
	this.type = type;
	this.onChange = nextTickOnce(onChange);
	options.dbOptions = Object(options.dbOptions);
	forEach(this.dbAttributes, function (name, dbName) {
		var value;
		if (!name) return;
		if (name === true) name = dbName;
		if (options[name] != null) return;
		if (options.dbOptions[dbName] != null) {
			value = options.dbOptions[dbName];
		} else if (type[dbName] != null) {
			value = type[dbName];
		} else {
			if (dbName === 'required') return;
			if (type[dbName] != null) value = type[dbName];
			else return;
		}
		options[name] = value;
	}, this);

	this._render(options);
	this.dom._dbjsInput = this;
	if (options.name) this.name = options.name;
	if (options.dbOptions.required) this.required = true;
	forEach(options, function (value, name) {
		if (name === 'class') {
			mergeClass.call(this.dom, value);
		} else if (htmlAttrs[name] || startsWith.call(name, 'data-')) {
			castAttr.call(this.dom, name, value);
		} else if (name === 'control') {
			forEach(value, function (value, name) {
				this.castControlAttribute(name, value);
			}, this);
		} else {
			this.castControlAttribute(name, value);
		}
	}, this);
	onChange();
	if (this.control) {
		document.addEventListener('reset', this._onReset, false);
		this.control.addEventListener('change', this.onChange, false);
	}
};

ee(Object.defineProperties(Input.prototype, assign({
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
	inputValue: d.gs(function () {
		return this.control.value;
	}, function (nu) {
		var old = this.inputValue;
		if (this._value !== nu) {
			this.control.setAttribute('value', this._value = nu);
		}
		if (nu !== old) {
			this.control.value = nu;
			try {
				dispatchEvt.call(this.control, 'change', eventOpts);
			} catch (ignore) {}
		} else {
			this.onChange();
		}
	}),
	value: d.gs(function () {
		return this.type.fromInputValue(this.inputValue);
	}, function (value) {
		value = this.type.toInputValue(value);
		if (value == null) value = '';
		this.inputValue = value;
	}),
	castControlAttribute: d(function (name, value) {
		if (name === 'class') {
			mergeClass.call(this.control, value);
		} else if (!this.controlAttributes[name] && !htmlAttrs[name] &&
				!startsWith.call(name, 'data-')) {
			return;
		}
		if (isRegExp(value)) value = value.source.slice(1, -1);
		castAttr.call(this.control, name, value);
	}),
	destroy: d(function () {
		this.document.removeEventListener('reset', this._onReset, false);
		this.emit('destroy');
	}),
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
}, autoBind({
	_onReset: d(function (e) {
		if (e.target !== this.control.form) return;
		this.inputValue = this._value;
	})
}))));
