'use strict';

var copy        = require('es5-ext/object/copy')
  , d           = require('es5-ext/object/descriptor')
  , extend      = require('es5-ext/object/extend')
  , dispatchEvt = require('dom-ext/html-element/#/dispatch-event-2')
  , elExtend    = require('dom-ext/element/#/extend')
  , Db          = require('dbjs')
  , relation    = require('dbjs/lib/_relation')
  , DOMInput    = require('./input')
  , eventOpts   = require('../_event-options')

  , getInputValue =
	Object.getOwnPropertyDescriptor(DOMInput.prototype, 'inputValue').get
  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), chooseLabel;
	this.items = {};
	DOMInput.call(this, document, ns, options);
	if (options.chooseLabel != null) {
		chooseLabel = options.chooseLabel;
	} else if (options.dbOptions.chooseLabel != null) {
		chooseLabel = options.dbOptions.chooseLabel;
	} else {
		chooseLabel = ns.chooseLabel && ns._chooseLabel;
	}
	if (chooseLabel) {
		this.chooseOption = this.items[''] = this.document.createElement('option');
		this.chooseOption.setAttribute('value', '');
		elExtend.call(this.chooseOption, chooseLabel);
		this.control.appendChild(this.chooseOption);
	}
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ required: true, size: true })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
		{ required: true })),
	_render: d(function () {
		this.control = this.dom = this.document.createElement('select');
	}),
	createOption: d(function (value, labelTextDOM) {
		var option;
		option = this.items[value] = this.document.createElement('option');
		option.setAttribute('value', value);
		elExtend.call(option, labelTextDOM);
		return option;
	}),
	inputValue: d.gs(getInputValue, function (nu) {
		var old = this.inputValue;
		if (this._value !== nu) {
			if (this.items.hasOwnProperty(this._value)) {
				this.items[this._value].removeAttribute('selected');
			}
			if (this.items.hasOwnProperty(nu)) {
				this.items[nu].setAttribute('selected', 'selected');
			}
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

relation.set('chooseLabel', Db.String);
Object.defineProperty(Db.Base, 'DOMSelect', d(Input));
