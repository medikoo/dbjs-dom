'use strict';

require('../string-line');

var Email = require('dbjs/lib/types-ext/string/string-line/email');

Email.toDOMInputBox = function (document) {
	var box = this.Base.toDOMInputBox(document)
	  , dom = box.dom;

	dom.setAttribute('type', 'email');
	if (this.max) dom.setAttribute('maxlength', this.max);
	if (this.multiple) dom.setAttribute('multiple', 'multiple');
	return box;
};

module.exports = Email;
