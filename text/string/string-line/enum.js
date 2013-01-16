'use strict';

var Db   = require('dbjs')
  , Enum = module.exports = require('dbjs-ext/string/string-line/enum');

Enum.set('DOMBox', Db.external(function () {
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
