'use strict';

var Db         = require('dbjs')
  , StringLine = require('dbjs-ext/string/string-line');

require('../string');

StringLine.set('DOMInputBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.apply(this, arguments);
		this.dom.setAttribute('type', 'text');
		if (ns.pattern) {
			this.dom.setAttribute('pattern', ns.pattern.source.slice(1, -1));
		}
		if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));

module.exports = StringLine;
