'use strict';

var Db       = require('dbjs')
  , Password = require('dbjs/lib/types-ext/string/string-line/password');

require('../string-line');

Password.set('DOMInputBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.apply(this, arguments);
		this.dom.setAttribute('type', 'password');
		if (ns.pattern) {
			this.dom.setAttribute('pattern', ns.pattern.source.slice(1, -1));
		}
		if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));

module.exports = Password;
