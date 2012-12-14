'use strict';

require('../string-line');

var Password = require('dbjs/lib/types-ext/string/string-line/password');

Password.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'password');
	input.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) input.setAttribute('maxlength', this.max);
	return new this.DOMInputBox(input);
};

module.exports = Password;
