'use strict';

var Db = require('./base');

Db.Base.set('DOMSelectBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.DOMInputBox;
	Box = function (document) {
		this.document = document;
		this.dom = document.createElement('select');
		this.options = {};
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.createOption = function (value, labelTextDOM) {
		var option;
		option = this.options[value] = this.document.createElement('option');
		option.setAttribute('value', value);
		option.appendChild(labelTextDOM);
		return option;
	};
	proto.set = function (value) {
		Object.keys(this.options).forEach(function (name) {
			this[name].selected = false;
			this[name].removeAttribute('selected');
		}, this.options);
		if (value == null) value = '';
		if (this.options[value]) {
			this.options[value].setAttribute('selected', 'selected');
			this.options[value].selected = true;
		}
	};
	return Box;
}));
