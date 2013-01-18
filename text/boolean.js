'use strict';

var Db = require('dbjs')

  , BooleanType = module.exports = Db.Boolean;

BooleanType.set('DOMBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMBox;
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
		label = this.ns[value.valueOf() ? '_trueLabel' : '_falseLabel'];
		this.dom.appendChild(label.toDOM(this.document));
	};
	return Box;
}));
