'use strict';

var assign      = require('es5-ext/object/assign')
  , d           = require('d')
  , autoBind    = require('d/auto-bind')
  , extend      = require('dom-ext/element/#/extend')
  , dispatchEvt = require('dom-ext/html-element/#/dispatch-event-2')
  , getId       = require('dom-ext/html-element/#/get-id')
  , delay       = require('timers-ext/delay')
  , DOMInput    = require('../string/string-line').Input
  , eventOpts   = require('../_event-options')

  , create = Object.create, render = DOMInput.prototype._render
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	this.items = create(null);
	this.valueMap = create(null);
	DOMInput.apply(this, arguments);
	this.control.addEventListener('change', delay(this.validateControlValue), false);
};
Input.prototype = Object.create(DOMInput.prototype, assign({
	constructor: d(Input),
	_render: d(function () {
		render.call(this);
		this.list = this.document.createElement('datalist');
		this.control.setAttribute('list', getId.call(this.list));
		this.dom = this.document.createElement('span');
		this.dom.appendChild(this.control);
		this.dom.appendChild(this.list);
	}),
	createOption: d(function (value, label, legend) {
		var option;
		this.valueMap[label] = value;
		option = this.items[label] = this.document.createElement('option');
		option.setAttribute('value', label);
		extend.call(option, legend || label);
		return option;
	})
}, autoBind({
	validateControlValue: d(function () {
		if (!this.control.value) return;
		if (this.items[this.control.value]) return;
		this.control.value = '';
		try {
			dispatchEvt.call(this.control, 'change', eventOpts);
		} catch (ignore) {}
	})
})));
