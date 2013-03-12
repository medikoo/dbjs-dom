'use strict';

var partial  = require('es5-ext/lib/Function/prototype/partial')
  , d        = require('es5-ext/lib/Object/descriptor')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , elExtend = require('dom-ext/lib/Element/prototype/extend')
  , Db       = require('dbjs')
  , nextTick = require('next-tick')
  , DOMInput = require('./input')
  , relation = require('dbjs/lib/_relation')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.document = document;
	this.ns = ns;
	this.control = this.dom = document.createElement('select');
	if (options.name) this.name = options.name;
	this.castKnownAttributes(options);
	this.dom._dbjsInput = this;
	this.items = {};
	document.addEventListener('reset',
		partial.call(nextTick, this.onchange.bind(this)), false);
	this.dom.addEventListener('change', this.onchange.bind(this), false);
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	createOption: d(function (value, labelTextDOM) {
		var option;
		option = this.items[value] = this.document.createElement('option');
		option.setAttribute('value', value);
		elExtend.call(option, labelTextDOM);
		return option;
	}),
	value: d.gs(getValue, function (nu) {
		var inputValue;
		if (nu != null) {
			if (nu.__toString) nu = nu.__toString.__value.call(nu);
			else nu = String(nu);
			inputValue = nu;
		} else {
			inputValue = '';
		}
		forEach(this.items, function (option, value) {
			if (value === inputValue) return;
			option.removeAttribute('selected');
		});
		this.items[inputValue].setAttribute('selected', 'selected');
		this.dom.value = inputValue;
		this._value = nu;
		if (this.changed) this.emit('change:changed', this.changed = false);
	})
});

relation.set('chooseLabel', Db.String);
Object.defineProperty(Db.Base, 'DOMSelect', d(Input));
