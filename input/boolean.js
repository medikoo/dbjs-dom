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
	var trueText, falseText, options = Object(arguments[2]);
	DOMRadio.call(this, document, ns, options);
	this.relation = options && options.relation;
	trueText = (this.relation && this.relation.__trueLabel.__value) ?
			this.relation._trueLabel.toDOM(document) : ns._trueLabel.toDOM(document);
	falseText = (this.relation && this.relation.__falseLabel.__value) ?
			this.relation._falseLabel.toDOM(document) :
			ns._falseLabel.toDOM(document);
	this.dom.appendChild(this.createOption('1', trueText));
	this.dom.appendChild(document.createTextNode(' '));
	this.dom.appendChild(this.createOption('0', falseText));
	this.trueInput = this.items['1'];
	this.falseInput = this.items['0'];
	this.castKnownAttributes(options);
};

Radio.prototype = Object.create(DOMRadio.prototype, {
	constructor: d(Radio),
	value: d.gs(function () {
		if (this.trueInput.checked) return true;
		else if (this.falseInput.checked) return false;
		else return null;
	}, function (value) {
		if (value != null) value = Boolean(value.valueOf());

		this.trueInput.checked = (value === true);
		if (value === true) this.trueInput.setAttribute('checked', 'checked');
		else this.trueInput.removeAttribute('checked');

		this.falseInput.checked = (value === false);
		if (value === false) this.falseInput.setAttribute('checked', 'checked');
		else this.falseInput.removeAttribute('checked');

		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

Checkbox = function (document, ns) {
	DOMCheckbox.apply(this, arguments);
	this.dom.setAttribute('value', '1');
	this.control = this.dom;
	this.dom = makeEl.call(document, 'span', this.dom,
		makeEl.call(document, 'input',
			{ type: 'hidden', name: this._name, value: '0' }));
};
Checkbox.prototype = Object.create(DOMCheckbox.prototype, {
	constructor: d(Checkbox),
	value: d.gs(function () { return this.control.checked; }, function (value) {
		value = (value == null) ? false : Boolean(value.valueOf());
		if (!value) {
			this.control.removeAttribute('checked');
			this.checked = false;
		} else {
			this.control.setAttribute('checked', 'checked');
			this.checked = true;
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

module.exports = Object.defineProperties(BooleanType, {
	unserializeDOMInputValue: d(function (value) {
		if (value === '0') return false;
		if (value === '1') return true;
		if (isArray(value) && isCopy.call(value.sort(), arrResult)) {
			return true;
		}
		return null;
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
