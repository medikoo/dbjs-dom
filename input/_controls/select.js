'use strict';

var copy           = require('es5-ext/object/copy')
  , assign         = require('es5-ext/object/assign')
  , d              = require('d')
  , dispatchEvt    = require('dom-ext/html-element/#/dispatch-event-2')
  , extend         = require('dom-ext/element/#/extend')
  , DOMInput       = require('./input')
  , resolveOptions = require('../utils/resolve-options')
  , eventOpts      = require('../_event-options')

  , getInputValue =
	Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2], chooseLabel;
	this.items = {};
	this.type = type;
	options = resolveOptions(options, type);
	DOMInput.call(this, document, type, options);
	if (options.chooseLabel != null) {
		chooseLabel = options.chooseLabel;
	} else if (options.dbOptions && (options.dbOptions.chooseLabel != null)) {
		chooseLabel = options.dbOptions.chooseLabel;
	} else {
		chooseLabel = type.chooseLabel;
	}
	if (chooseLabel) {
		this.chooseOption = this.items[''] = this.document.createElement('option');
		this.chooseOption.setAttribute('value', '');
		extend.call(this.chooseOption, chooseLabel);
		this.control.appendChild(this.chooseOption);
	}
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ required: true, size: true })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes), { required: true })),
	_render: d(function () {
		this.control = this.dom = this.document.createElement('select');
	}),
	createOption: d(function (value, labelTextDOM) {
		var option;
		option = this.items[value] = this.document.createElement('option');
		option.setAttribute('value', value);
		extend.call(option, labelTextDOM);
		return option;
	}),
	inputValue: d.gs(getInputValue, function (nu) {
		var old = this.inputValue;
		if (this._value !== nu) {
			if (this.items.hasOwnProperty(this._value)) {
				this.items[this._value].removeAttribute('selected');
			}
			if (this.items.hasOwnProperty(nu)) this.items[nu].setAttribute('selected', 'selected');
			this._value = nu;
		}
		if (nu !== old) {
			this.control.value = nu;
			try {
				dispatchEvt.call(this.control, 'change', eventOpts);
			} catch (ignore) {}
		} else {
			this.onChange();
		}
	})
});
