'use strict';

var copy        = require('es5-ext/lib/Object/copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , extend      = require('es5-ext/lib/Object/extend')
  , dispatchEvt = require('dom-ext/lib/HTMLElement/prototype/dispatch-event-2')
  , Db          = require('dbjs')
  , DOMInput    = require('./input')
  , eventOpts   = require('../_event-options')

  , getValue = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'value').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
	this.dom.addEventListener('input', this.onChange, false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ cols: true, inputmode: true, maxlength: true, placeholder: true,
			readonly: true, required: true, rows: true, wrap: true })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
		{ max: 'maxlength', inputPlaceholder: 'placeholder', required: true })),
	_render: d(function () {
		this.control = this.dom = this.document.createElement('textarea');
		this.dom.appendChild(this.document.createTextNode(''));
	}),
	value: d.gs(getValue, function (value) {
		var old = this.inputValue, nu = this.ns.toInputValue(value);
		if (nu == null) nu = '';
		if (this._value !== nu) this.control.firstChild.data = this._value = nu;
		if (nu !== old) {
			this.control.value = nu;
			try { dispatchEvt.call(this.control, 'change', eventOpts); } catch (e) {}
		} else {
			this.onChange();
		}
	})
});

Object.defineProperty(Db.Base, 'DOMTextarea', d(Input));
