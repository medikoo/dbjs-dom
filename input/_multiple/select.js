'use strict';

var d           = require('d')
  , Set         = require('es6-set')
  , some        = require('es6-set/ext/some')
  , dispatchEvt = require('dom-ext/html-element/#/dispatch-event-2')
  , DOMInput    = require('../_controls/input')
  , DOMSelect   = require('../_controls/select')
  , eventOpts   = require('../_event-options')

  , forEach = Array.prototype.forEach
  , selectRender = DOMSelect.prototype._render
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	this.items = {};
	this._value = new Set();
	DOMInput.apply(this, arguments);
};
Input.prototype = Object.create(DOMSelect.prototype, {
	constructor: d(Input),
	_value: d(null),
	_render: d(function () {
		selectRender.call(this);
		this.control.setAttribute('multiple', 'multiple');
	}),
	inputValue: d.gs(function () {
		var value = new Set();
		forEach.call(this.control.options, function (option) {
			if (option.selected) value.add(option.value);
		});
		return value;
	}, function (value) {
		var current = this.inputValue, currentSaved = this._value, changed;
		if (value == null) value = new Set();
		this._value = value;
		currentSaved.forEach(function (item) {
			if (!value.has(item)) this.items[item].removeAttribute('selected');
		}, this);
		current.forEach(function (item) {
			if (!value.has(item)) {
				this.items[item].selected = false;
				changed = true;
			}
		}, this);
		value.forEach(function (item) {
			if (!currentSaved.has(item)) this.items[item].setAttribute('selected', 'selected');
			if (!current.has(item)) {
				this.items[item].selected = true;
				changed = true;
			}
		}, this);
		if (changed) {
			try {
				dispatchEvt.call(this.control, 'change', eventOpts);
			} catch (ignore) {}
		} else {
			this.onChange();
		}
	}),
	value: d.gs(function () {
		var value = new Set();
		this.inputValue.forEach(function (item) {
			value.add(this.type.fromInputValue(item));
		}, this);
		return value;
	}, function (value) {
		var result = new Set();
		if (value != null) {
			value.forEach(function (item) {
				result.add(this.type.toInputValue(item));
			}, this);
		}
		this.inputValue = result;
	}),
	onChange: d(function () {
		var value, inputValue, changed, valid, emitChanged, emitValid, control;
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
		if (inputValue.size === this._value.size) {
			changed = some.call(inputValue, function (item) { return !this._value.has(item); }, this);
		} else {
			changed = true;
		}
		valid = true;
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
});
