'use strict';

require('../string-line');

var Password = require('dbjs/lib/types-ext/string/string-line/password');

Password.toDOMInputBox = function (document) {
	var box = this.Base.toDOMInputBox(document)
	  , dom = box.dom;

	dom.setAttribute('type', 'password');
	dom.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) dom.setAttribute('maxlength', this.max);
	return box;
};

module.exports = Password;
