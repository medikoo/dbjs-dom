'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , Db          = require('dbjs')
  , DOMRadio    = require('./_controls/radio')
  , DOMCheckbox = require('./_controls/checkbox')

  , BooleanType = Db.Boolean
  , Radio, Checkbox;

Radio = function (document, ns, options) {
	var trueText, falseText;
	DOMRadio.call(this, document, ns);
	this.relation = options && options.relation;
	trueText = (this.relation && this.relation.__trueLabel.__value) ?
			this.relation._trueLabel.toDOM(document) : ns._trueLabel.toDOM(document);
	falseText = (this.relation && this.relation.__falseLabel.__value) ?
			this.relation._falseLabel.toDOM(document) :
			ns._falseLabel.toDOM(document);
	this.dom.appendChild(this.createOption('1', trueText));
	this.dom.appendChild(document.createTextNode(' '));
	this.dom.appendChild(this.createOption('0', falseText));
	this.trueInput = this.options['1'];
	this.falseInput = this.options['0'];
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
};
Checkbox.prototype = Object.create(DOMCheckbox.prototype, {
	constructor: d(Checkbox),
	value: d.gs(function () { return this.dom.checked; }, function (value) {
		value = (value == null) ? false : Boolean(value.valueOf());
		if (!value) {
			this.dom.removeAttribute('checked');
			this.checked = false;
		} else {
			this.dom.setAttribute('checked', 'checked');
			this.checked = true;
		}
		this._value = value;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

module.exports = Object.defineProperties(BooleanType, {
	DOMRadio: d(Radio),
	DOMCheckbox: d(Checkbox),
	toDOMInput: d(function (document/*, options*/) {
		var box, options = Object(arguments[1]);
		if (options.type === 'checkbox') {
			box = new this.DOMCheckbox(document, this, options);
		} else {
			box = new this.DOMRadio(document, this, options);
		}
		box.castKnownAttributes(options);
		return box;
	})
});
