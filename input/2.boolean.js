'use strict';

var isCopy         = require('es5-ext/array/#/is-copy')
  , d              = require('d')
  , makeEl         = require('dom-ext/document/#/make-element')
  , dispatchEvt    = require('dom-ext/html-element/#/dispatch-event-2')
  , resolveOptions = require('./utils/resolve-options')
  , DOMInput       = require('./_controls/input')
  , DOMRadio       = require('./_controls/radio')
  , DOMCheckbox    = require('./_controls/checkbox')
  , eventOpts      = require('./_event-options')

  , isArray = Array.isArray, defineProperties = Object.defineProperties
  , getValue =
	Object.getOwnPropertyDescriptor(DOMCheckbox.prototype, 'value').get
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Radio, Checkbox, arrResult = ['0', '1'].sort(), getLabel;

getLabel = function (name, options, type) {
	name += 'Label';
	if (options[name]) return options[name];
	options = options.dbOptions;
	if (options[name]) return options[name];
	return type[name];
};

Radio = function (document, type/*, options*/) {
	var tOption, fOption, options = arguments[2], reverse;
	this.type = type;
	options = resolveOptions(options, type);
	DOMRadio.call(this, document, type, options);
	tOption = this.createOption('1', getLabel('true', options, type),
		options.controls && options.controls[1]);
	fOption = this.createOption('0', getLabel('false', options, type),
		options.controls && options.controls[0]);
	this.items['1'].setAttribute('data-type', 'boolean');
	this.items['0'].setAttribute('data-type', 'boolean');

	reverse = Number(options.order) < 0;
	this.dom.appendChild(reverse ? fOption : tOption);
	this.dom.appendChild(reverse ? tOption : fOption);
};
Radio.prototype = Object.create(DOMRadio.prototype, { constructor: d(Radio) });

Checkbox = function (document, type/*, options*/) {
	DOMCheckbox.apply(this, arguments);
};
Checkbox.prototype = Object.create(DOMCheckbox.prototype, {
	constructor: d(Checkbox),
	_value: d('0'),
	_render: d(function () {
		var el = makeEl.bind(this.document);
		this.dom = el('span', this.control = el('input',
			{ type: 'checkbox', 'data-type': 'boolean', value: '1' }),
			this.hidden = el('input', { type: 'hidden',
				'data-type': 'boolean', value: '0' }));
	}),
	name: d.gs(getName, function (name) {
		this._name = name;
		name = this.name;
		if (name) {
			this.control.setAttribute('name', name);
			this.hidden.setAttribute('name', name);
		} else {
			this.control.removeAttribute('name');
			this.hidden.removeAttribute('name');
		}
	}),
	inputValue: d.gs(function () {
		return this.control.checked ? '1' : '0';
	}, function (nu) {
		var old = this.inputValue;

		if (nu !== '1') this.control.removeAttribute('checked');
		else this.control.setAttribute('checked', 'checked');

		this._value = nu;
		if (nu !== old) {
			this.control.checked = (nu === '1');
			try {
				dispatchEvt.call(this.control, 'change', eventOpts);
			} catch (ignore) {}
		} else {
			this.onChange();
		}
	}),
	value: d.gs(getValue, function (value) {
		value = this.type.toInputValue(value);
		if (value == null) value = '0';
		this.inputValue = value;
	})
});

module.exports = exports = function (db) {
	defineProperties(db.Boolean, {
		fromInputValue: d(function (value) {
			if (value == null) return undefined;
			if (value === '0') return false;
			if (value === '1') return true;
			if (isArray(value) && isCopy.call(value.sort(), arrResult)) {
				return true;
			}
			return null;
		}),
		toInputValue: d(function (value) {
			if (value == null) return null;
			return value.valueOf() ? '1' : '0';
		}),
		DOMRadio: d(Radio),
		DOMCheckbox: d(Checkbox),
		toDOMInput: d(function (document/*, options*/) {
			var options = resolveOptions(arguments[1], this);
			if (options.multiple) {
				return new this.DOMMultipleInput(document, this, options);
			}
			if (options.type === 'checkbox') {
				return new this.DOMCheckbox(document, this, options);
			}
			return new this.DOMRadio(document, this, options);
		})
	});
};

exports.Radio = Radio;
exports.Checkbox = Checkbox;
