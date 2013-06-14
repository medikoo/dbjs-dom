'use strict';

var copy        = require('es5-ext/lib/Object/copy')
  , extend      = require('es5-ext/lib/Object/extend')
  , d           = require('es5-ext/lib/Object/descriptor')
  , dispatchEvt = require('dom-ext/lib/HTMLElement/prototype/dispatch-event-2')
  , Db          = require('dbjs')
  , DOMInput    = require('./input')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_value: d(null),
	valid: d(true),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ required: true })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'checkbox');
	}),
	required: d.gs(function () { return this._required; }, function (value) {
		value = Boolean(value);
		if (this._required === value) return;
		this._required = value;
		this.onChange();
		this.emit('change:required', value);
	}),
	inputValue: d.gs(function () {
		return this.control.checked ? this.control.value : null;
	}),
	value: d.gs(getValue, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);

		if (nu == null) {
			this.control.removeAttribute('checked');
		} else {
			if (this._value == null) {
				this.control.setAttribute('checked', 'checked');
			}
			this.control.setAttribute('value', nu);
		}

		this._value = nu;
		if (nu !== old) {
			this.control.checked = (nu != null);
			try { dispatchEvt.call(this.control, 'change'); } catch (e) {}
		} else {
			this.onChange();
		}
	})
});

Object.defineProperty(Db.Base, 'DOMCheckbox', d(Input));
