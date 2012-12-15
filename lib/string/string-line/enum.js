'use strict';

var Db   = require('../../base')
  , Enum = require('dbjs/lib/types-ext/string/string-line/enum');

require('../../dom-select-box');

Enum.set('chooseLabel',
	Db.StringLine.rel({ required: true, value: 'Choose option:' }));

Enum.set('DOMEnumSelectBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.DOMSelectBox;
	Box = function (document, ns) {
		Parent.call(this, document);
		this.dom.appendChild(this.createOption('',
			ns._chooseLabel.toDOM(document)));
		ns.options.forEach(function (value, item) {
			this.dom.appendChild(this.createOption(value,
				item._label.toDOM(document)));
		}, this);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));
Enum.toDOMInputBox = function (document) {
	return new this.DOMEnumSelectBox(document, this);
};

Enum.set('DOMEnumBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.DOMBox;
	Box = function (document) {
		this.document = document;
		this.dom = document.createElement('span');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		var label;
		if (this.dom.firstChild) this.dom.removeChild(this.dom.firstChild);
		label = value.ns.options.get(value)._label;
		this.dom.appendChild(label.toDOM(this.document));
	};
	return Box;
}));

Enum.toDOMBox = function (document) { return new this.DOMEnumBox(document); };

module.exports = Enum;
