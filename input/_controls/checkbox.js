'use strict';

var copy        = require('es5-ext/object/copy')
  , assign      = require('es5-ext/object/assign')
  , d           = require('d')
  , dispatchEvt = require('dom-ext/html-element/#/dispatch-event-2')
  , DOMInput    = require('./input')
  , eventOpts   = require('../_event-options')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	_value: d(null),
	valid: d(true),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes), { required: true })),
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
	}, function (nu) {
		var old = this.inputValue;
		if (nu == null) {
			this.control.removeAttribute('checked');
		} else {
			if (this._value == null) this.control.setAttribute('checked', 'checked');
			this.control.setAttribute('value', nu);
		}

		this._value = nu;
		if (nu !== old) {
			this.control.checked = (nu != null);
			try {
				dispatchEvt.call(this.control, 'change', eventOpts);
			} catch (ignore) {}
		} else {
			this.onChange();
		}
	}),
	value: d.gs(getValue, function (value) { this.inputValue = this.type.toInputValue(value); })
});
