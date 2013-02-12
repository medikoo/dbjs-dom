'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , forEach       = require('es5-ext/lib/Object/for-each')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , ee            = require('event-emitter/lib/core')
  , castAttribute = require('dom-ext/lib/Element/prototype/cast-attribute')
  , Db            = require('dbjs')

  , Input;

module.exports = Input = function (document, ns) {
	this.document = document;
	this.ns = ns;
	this.dom = document.createElement('input');
	this.dom._dbjsInput = this;
};

ee(Object.defineProperties(Input.prototype, {
	_value: d(null),
	knownAttributes: d({ class: true, id: true, name: true, required: true,
			style: true }),
	changed: d(false),
	required: d(false),
	valid: d(false),
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
		if (changedChanged) this.emit('change:changed', this.changed);
		if (!this.required || (this.valid === (value != null))) return;
		this.emit('change:valid', this.valid = !this.valid);
	}),
	toDOM: d(function () { return this.dom; }),
	value: d.gs(function () {
		var value = this.dom.value;
		return (value === '') ? null : value;
	}, function (value) {
		if (value == null) {
			value = null;
			this.dom.value = '';
			this.dom.removeAttribute('value');
		} else {
			if (value.__toString) value = value.__toString.__value.call(value);
			else value = String(value);
			this.dom.value = value;
			this.dom.setAttribute('value', value);
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
