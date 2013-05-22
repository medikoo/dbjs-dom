'use strict';

var isCopy      = require('es5-ext/lib/Array/prototype/is-copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , makeEl      = require('dom-ext/lib/Document/prototype/make-element')
  , Db          = require('dbjs')
  , DOMInput    = require('./_controls/input')
  , DOMRadio    = require('./_controls/radio')
  , DOMCheckbox = require('./_controls/checkbox')

  , isArray = Array.isArray
  , BooleanType = Db.Boolean
  , getValue =
	Object.getOwnPropertyDescriptor(DOMCheckbox.prototype, 'value').get
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Radio, Checkbox, arrResult = ['0', '1'].sort(), getLabel;

getLabel = function (name, options, ns) {
	name += 'Label';
	if (options[name]) return options[name];
	options = options.dbOptions;
	if (options[name]) return options['_' + name];
	return ns['_' + name];
};

Radio = function (document, ns/*, options*/) {
	var tOption, fOption, options = Object(arguments[2]), reverse;
	DOMRadio.call(this, document, ns, options);
	tOption = this.createOption('1', getLabel('true', options, ns));
	fOption = this.createOption('0', getLabel('false', options, ns));
	this.items['1'].setAttribute('data-type', 'boolean');
	this.items['0'].setAttribute('data-type', 'boolean');

	reverse = Number(options.order) < 0;
	this.dom.appendChild(reverse ? fOption : tOption);
	this.dom.appendChild(document.createTextNode(' '));
	this.dom.appendChild(reverse ? tOption : fOption);
};
Radio.prototype = Object.create(DOMRadio.prototype, { constructor: d(Radio) });

Checkbox = function (document, ns/*, options*/) {
	DOMCheckbox.apply(this, arguments);
};
Checkbox.prototype = Object.create(DOMCheckbox.prototype, {
	constructor: d(Checkbox),
	_value: d('0'),
	inputValue: d.gs(function () { return this.control.checked ? '1' : '0'; }),
	_render: d(function () {
		var el = makeEl.bind(this.document);
		this.controls = {};
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
	value: d.gs(getValue, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (nu == null) nu = '0';

		if (nu !== '1') this.control.removeAttribute('checked');
		else this.control.setAttribute('checked', 'checked');

		if (nu !== old) this.control.checked = (nu === '1');
		this.onChange();
	}),
	setCheckedValue: d(function () { throw new Error("Not supported"); })
});

module.exports = Object.defineProperties(BooleanType, {
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
		else return value.valueOf() ? '1' : '0';
	}),
	DOMRadio: d(Radio),
	DOMCheckbox: d(Checkbox),
	toDOMInput: d(function (document/*, options*/) {
		var options = Object(arguments[1]);
		if (options.multiple) {
			return new this.DOMMultipleInput(document, this, options);
		}
		if (options.type === 'checkbox') {
			return new this.DOMCheckbox(document, this, options);
		} else {
			return new this.DOMRadio(document, this, options);
		}
	})
});
