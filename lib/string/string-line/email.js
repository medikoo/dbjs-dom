'use strict';

var Db    = require('dbjs')
  , Email = require('dbjs-ext/string/string-line/email');

require('../string-line');

Email.set('DOMInputBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.apply(this, arguments);
		this.dom.setAttribute('type', 'email');
		if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	return Box;
}));

module.exports = Email;
