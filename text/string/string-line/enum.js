'use strict';

var Db   = require('dbjs')
  , Enum = module.exports = require('dbjs-ext/string/string-line/enum');

Enum.set('DOMBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMBox;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.box = new Parent(document, ns);
		this.dom = this.box.dom;
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		this.ns.options.get(value)._label.assignDOMBox(this.box);
	};
	return Box;
}));
