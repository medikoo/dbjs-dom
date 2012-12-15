'use strict';

var Db         = require('./base')
  , StringType = require('dbjs/lib/types-base/string');

StringType.set('DOMInputBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.dom = document.createElement('textarea');
		if (ns.max) this.dom.setAttribute('maxlength', ns.max);
		this.dom.appendChild(document.createTextNode(''));
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if (value == null) {
			this.dom.value = '';
			this.dom.firstChild.data = '';
			return;
		}
		this.dom.value = value;
		this.dom.firstChild.data = value;
	};
	return Box;
}));

module.exports = StringType;
