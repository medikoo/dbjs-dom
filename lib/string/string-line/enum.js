'use strict';

var Db   = require('dbjs')
  , Enum = require('dbjs/lib/types-ext/string/string-line/enum');

require('../string-line');
require('../../dom-select-box');

Enum.set('chooseLabel',
	Db.StringLine.rel({ required: true, value: 'Choose:' }));

Enum.set('DOMInputBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMSelectBox;
	Box = function (document, ns) {
		Parent.call(this, document, ns);
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

Enum.set('DOMBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.StringLine.DOMBox;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.dom = document.createElement('span');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		var label;
		if (this.dom.firstChild) this.dom.removeChild(this.dom.firstChild);
		label = this.ns.options.get(value)._label;
		this.dom.appendChild(label.toDOM(this.document));
	};
	return Box;
}));

module.exports = Enum;
