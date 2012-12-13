'use strict';

require('../string-line');

var Email = require('dbjs/lib/types-ext/string/string-line/email');

Email.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'email');
	if (this.max) input.setAttribute('maxlength', this.max);
	if (this.multiple) input.setAttribute('multiple', 'multiple');
	return new this.DOMBox(input);
};

module.exports = Email;
