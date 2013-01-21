'use strict';

var Db = require('dbjs');

Db.Base.set('DOMSelectBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.DOMInputBox;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
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
			this[name].removeAttribute('selected');
		}, this.options);
		if (value == null) value = '';
		if (this.options[value]) {
			this.options[value].setAttribute('selected', 'selected');
			this.dom.value = value;
		}
	};
	return Box;
}));
