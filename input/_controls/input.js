'use strict';

var assign         = require('es5-ext/object/assign')
  , forEach        = require('es5-ext/object/for-each')
  , isRegExp       = require('es5-ext/reg-exp/is-reg-exp')
  , startsWith     = require('es5-ext/string/#/starts-with')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , ee             = require('event-emitter')
  , castAttr       = require('dom-ext/element/#/cast-attribute')
  , dispatchEvt    = require('dom-ext/html-element/#/dispatch-event-2')
  , mergeClass     = require('dom-ext/html-element/#/merge-class')
  , once           = require('timers-ext/once')
  , resolveOptions = require('../utils/resolve-options')
  , htmlAttrs      = require('../_html-attributes')
  , eventOpts      = require('../_event-options')

  , defineProperty = Object.defineProperty
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2], onChange = this.onChange.bind(this);
	this.document = document;
	this.type = type;
	options = resolveOptions(options, type);
	if (options.observable) this.observable = options.observable;
	this.onChange = once(onChange);
	this._resolveDbAttributes(options);
	this._render(options);
	this.dom._dbjsInput = this;
	if (options.name) this.name = options.name;
	this.required = (options.required != null)
		? Boolean(options.required) : options.dbOptions.required;
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
	if (this.control) this.control.addEventListener('change', this.onChange, false);
};

ee(Object.defineProperties(Input.prototype, assign({
	_value: d(''),
	_name: d(''),
	_resolveDbAttributes: d(function (options) {
		if (this._dbAttributesResolved) return;
		options.dbOptions = Object(options.dbOptions);
		forEach(this.dbAttributes, function (name, dbName) {
			var value;
			if (!name) return;
			if (name === true) name = dbName;
			if (options[name] != null) return;
			if (options.dbOptions[dbName] != null) {
				value = options.dbOptions[dbName];
			} else if (this.type[dbName] != null) {
				value = this.type[dbName];
			} else {
				if (dbName === 'required') return;
				if (this.type[dbName] != null) value = this.type[dbName];
				else return;
			}
			options[name] = value;
		}, this);
		defineProperty(this, '_dbAttributesResolved', d(true));
	}),
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
		return (this._index == null) ? '' : '[' + ((this._index === true) ? '' : this._index) + ']';
	}),
	index: d.gs(function () { return this._index; }, function (index) {
		if (index == null) index = null;
		else if (index !== true) index = (index >>> 0);
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
		if (this.form) this.form.removeEventListener('reset', this._onReset, false);
		this.emit('destroy');
	}),
	onChange: d(function () {
		var value, inputValue, changed, valid, emitChanged, emitValid, control, isRequired;
		control = this.control || (this.controls ? this.controls[Object.keys(this.controls)[0]] : null);
		if (control) {
			if (control.form) {
				if (this.form !== control.form) {
					if (this.form) this.form.removeEventListener('reset', this._onReset, false);
					this.form = control.form;
					this.form.addEventListener('reset', this._onReset, false);
				}
			}
		}
		inputValue = this.inputValue;
		value = this.value;
		changed = (inputValue !== this._value);
		if (value != null) {
			valid = this.type.is(value, this.observable && this.observable.descriptor);
		} else {
			if (this.required) isRequired = true;
			else if (this.observable) isRequired = this.observable.descriptor.required;
			if (isRequired) valid = false;
			else valid = ((inputValue == null) || !inputValue.trim());
		}

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
	_onReset: d(function (e) { this.inputValue = this._value; })
}))));
