'use strict';

require('../string');

var StringLine = require('dbjs/lib/types-ext/string/string-line');

StringLine.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) input.setAttribute('maxlength', this.max);
	return new this.DOMInputBox(input);
};

module.exports = StringLine;
