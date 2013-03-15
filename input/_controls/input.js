'use strict';

var partial       = require('es5-ext/lib/Function/prototype/partial')
  , d             = require('es5-ext/lib/Object/descriptor')
  , forEach       = require('es5-ext/lib/Object/for-each')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , ee            = require('event-emitter/lib/core')
  , castAttribute = require('dom-ext/lib/Element/prototype/cast-attribute')
  , nextTick      = require('next-tick')
  , Db            = require('dbjs')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.document = document;
	this.ns = ns;
	this.control = this.dom = document.createElement('input');
	if (options.name) this.name = options.name;
	this.castKnownAttributes(options);
	this.dom._dbjsInput = this;
	document.addEventListener('reset',
		partial.call(nextTick, this.onchange.bind(this)), false);
};

ee(Object.defineProperties(Input.prototype, {
	_value: d(null),
	knownAttributes: d({ class: true, id: true, required: true, style: true }),
	changed: d(false),
	required: d(false),
	valid: d(false),
	name: d.gs(function () { return this._name; }, function (name) {
		this._name = name;
		this.control.setAttribute('name', name);
	}),
	onchange: d(function () {
		var value = this.value, changedChanged;
		if (value !== this._value) {
			if (!this.changed) {
				this.changed = true;
				changedChanged = true;
			}
		} else if (this.changed) {
			this.changed = false;
			changedChanged = true;
		}
		this.emit('change', value);
		if (changedChanged) this.emit('change:changed', this.changed);
		if (this.valid === (!this.required || (value != null))) return;
		this.emit('change:valid', this.valid = !this.valid);
	}),
	toDOM: d(function () { return this.dom; }),
	value: d.gs(function () {
		var value = this.control.value.trim();
		return (value === '') ? null : value;
	}, function (value) {
		if (value == null) {
			value = null;
			this.control.value = '';
			this.control.removeAttribute('value');
		} else {
			if (value.__toString) value = value.__toString.__value.call(value);
			else value = String(value);
			this.control.value = value;
			this.control.setAttribute('value', value);
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	}),
	castAttribute: d(function (name, value) {
		castAttribute.call(this.dom, name, value);
	}),
	castKnownAttributes: d(function (attrs) {
		forEach(attrs, function (value, name) {
			if (this.knownAttributes[name] ||
					(startsWith.call(name, 'data-'))) {
				this.castAttribute(name, value);
			}
		}, this);
	})
}));

Object.defineProperty(Db.Base, 'DOMInput', d(Input));
