'use strict';

var Db = require('dbjs');

Db.Base.set('DOMRadioBox', Db.fixed(function () {
	var Parent, Box, proto, localAttrs = { name: true, required: true };
	Parent = this.DOMInputBox;
	Box = function (document) {
		this.document = document;
		this.dom = document.createElement('ul');
		this.inputs = {};
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.createItem = function (value, labelTextDOM) {
		var dom, label, input;
		dom = this.document.createElement('li');
		label = dom.appendChild(this.document.createElement('label'));
		input = this.inputs[value] =
			label.appendChild(this.document.createElement('input'));
		input.setAttribute('type', 'radio');
		input.setAttribute('value', value);
		label.appendChild(this.document.createTextNode(' '));
		label.appendChild(labelTextDOM);
		return dom;
	};
	proto.set = function (value) {
		if (value == null) {
			Object.keys(this.inputs).forEach(function (name) {
				this[name].checked = false;
				this[name].removeAttribute('checked');
			}, this.inputs);
		} else {
			this.inputs[value].setAttribute('checked', 'checked');
			this.inputs[value].checked = true;
		}
	};
	proto.setAttribute = function (name, value) {
		if (localAttrs.hasOwnProperty(name)) {
			Object.keys(this.inputs).forEach(function (iName) {
				this[iName].setAttribute(name, value);
			}, this.inputs);
			return;
		}
		this.dom.setAttribute(name, value);
	};
	return Box;
}));
