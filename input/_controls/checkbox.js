'use strict';

var copy     = require('es5-ext/lib/Object/copy')
  , d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('./input')

  , Input, knownAttributes = copy(DOMInput.prototype.knownAttributes);

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
	this.dom.setAttribute('type', 'checkbox');
	this.dom.addEventListener('change', this.onchange.bind(this), false);
};

delete knownAttributes.required;
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	valid: d(true),
	knownAttributes: d(knownAttributes),
	onchange: d(function () {
		var value = this.checked, changedChanged;
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
	}),
	value: d.gs(function () {
		return this.dom.checked ? this.dom.value : null;
	}, function (value) {
		value = (value == null) ? false : Boolean(value.valueOf());
		if (value) {
			this.dom.setAttribute('checked', 'checked');
			this.checked = true;
		} else {
			this.dom.removeAttribute('checked');
			this.checked = false;
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

Object.defineProperty(Db.Base, 'DOMCheckbox', d(Input));
