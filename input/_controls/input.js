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
	this.castHtmlAttributes(options);
	this.dom._dbjsInput = this;
	document.addEventListener('reset',
		partial.call(nextTick, this.onchange.bind(this)), false);
};

ee(Object.defineProperties(Input.prototype, {
	_value: d(''),
	htmlAttributes: d({ class: true, id: true, required: true, style: true }),
	changed: d(false),
	required: d(false),
	valid: d(false),
	name: d.gs(function () { return this._name + this._indexString; },
		function (name) {
			this._name = name;
			this.control.setAttribute('name', name + this._indexString);
		}),
	_index: d(null),
	_indexString: d.gs(function () {
		return (this._index == null) ? '' : '[' + this._index + ']';
	}),
	index: d.gs(function () { return this._index; }, function (index) {
		index = (index == null) ? null : (index >>> 0);
		if (index === this._index) return;
		this._index = index;
		this.control.setAttribute('name', this._name + this._indexString);
	}),
	onchange: d(function () {
		var value = this.inputValue, changedChanged;
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
	inputValue: d.gs(function () { return this.control.value; }),
	value: d.gs(function () {
		return this.ns.fromInputValue(this.inputValue);
	}, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (this._value !== nu) {
			this.control.setAttribute('value', this._value = nu);
		}
		if (nu !== old) {
			this.control.value = nu;
			this.onchange();
		}
	}),
	castAttribute: d(function (name, value) {
		castAttribute.call(this.dom, name, value);
	}),
	castHtmlAttributes: d(function (attrs) {
		forEach(attrs, function (value, name) {
			if (this.htmlAttributes[name] ||
					(startsWith.call(name, 'data-'))) {
				this.castAttribute(name, value);
			}
		}, this);
	})
}));

Object.defineProperty(Db.Base, 'DOMInput', d(Input));
