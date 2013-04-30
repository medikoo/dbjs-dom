'use strict';

var isCopy      = require('es5-ext/lib/Array/prototype/is-copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , makeEl      = require('dom-ext/lib/Document/prototype/make-element')
  , Db          = require('dbjs')
  , DOMRadio    = require('./_controls/radio')
  , DOMCheckbox = require('./_controls/checkbox')

  , isArray = Array.isArray
  , BooleanType = Db.Boolean
  , Radio, Checkbox, arrResult = ['0', '1'].sort();

Radio = function (document, ns/*, options*/) {
	var trueText, falseText, tOption, fOption, options = Object(arguments[2]);
	DOMRadio.call(this, document, ns, options);
	this.relation = options && options.relation;
	if (options.trueLabel) {
		trueText = options.trueLabel;
	} else if (this.relation && this.relation.__trueLabel.__value) {
		trueText = this.relation._trueLabel.toDOM(document);
	} else {
		trueText = ns._trueLabel.toDOM(document);
	}
	if (options.falseLabel) {
		falseText = options.falseLabel;
	} else if (this.relation && this.relation.__falseLabel.__value) {
		falseText = this.relation._falseLabel.toDOM(document);
	} else {
		falseText = ns._falseLabel.toDOM(document);
	}
	tOption = this.createOption('1', trueText);
	fOption = this.createOption('0', falseText);

	if (Number(options.order) < 0) {
		this.dom.appendChild(fOption);
		this.dom.appendChild(document.createTextNode(' '));
		this.dom.appendChild(tOption);
	} else {
		this.dom.appendChild(tOption);
		this.dom.appendChild(document.createTextNode(' '));
		this.dom.appendChild(fOption);
	}
	this.trueInput = this.items['1'];
	this.trueInput.setAttribute('data-type', 'boolean');
	this.falseInput = this.items['0'];
	this.falseInput.setAttribute('data-type', 'boolean');
	this.castHtmlAttributes(options);
};
Radio.prototype = Object.create(DOMRadio.prototype, { constructor: d(Radio) });

Checkbox = function (document, ns) {
	DOMCheckbox.apply(this, arguments);
	this.control = this.dom;
	this.control.setAttribute('data-type', 'boolean');
	this.dom = makeEl.call(document, 'span', this.dom,
		makeEl.call(document, 'input', { type: 'hidden', name: this._name,
			value: '0', 'data-type': 'boolean' }));
};
Checkbox.prototype = Object.create(DOMCheckbox.prototype, {
	constructor: d(Checkbox),
	inputValue: d.gs(function () { return this.control.checked ? '1' : '0'; })
});

module.exports = Object.defineProperties(BooleanType, {
	fromInputValue: d(function (value) {
		if (value === '') return null;
		if (value === '0') return false;
		if (value === '1') return true;
		if (isArray(value) && isCopy.call(value.sort(), arrResult)) {
			return true;
		}
		return null;
	}),
	toInputValue: d(function (value) {
		if (value == null) return '';
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
