'use strict';

var Db = require('./base');

Db.Base.set('DOMRadioBox', Db.external(function () {
	var Parent, Box, proto, localAttrs;
	localAttrs = { name: true, required: true };
	Parent = this.DOMInputBox;
	Box = function (document) {
		this.document = document;
		this.dom = document.createElement('ul');
		this.options = {};
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.createOption = function (value, labelTextDOM) {
		var dom, label, input;
		dom = this.document.createElement('li');
		label = dom.appendChild(this.document.createElement('label'));
		input = this.options[value] =
			label.appendChild(this.document.createElement('input'));
		input.setAttribute('type', 'radio');
		input.setAttribute('value', value);
		label.appendChild(this.document.createTextNode(' '));
		label.appendChild(labelTextDOM);
		return dom;
	};
	proto.set = function (value) {
		if (value == null) {
			Object.keys(this.options).forEach(function (name) {
				this[name].checked = false;
				this[name].removeAttribute('checked');
			}, this.options);
		} else {
			this.options[value].setAttribute('checked', 'checked');
			this.options[value].checked = true;
		}
	};
	proto.setAttribute = function (name, value) {
		if (localAttrs.hasOwnProperty(name)) {
			Object.keys(this.options).forEach(function (iName) {
				this[iName].setAttribute(name, value);
			}, this.options);
			return;
		}
		Parent.prototype.setAttribute.call(this, name, value);
	};
	return Box;
}));
