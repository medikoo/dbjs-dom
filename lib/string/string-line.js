'use strict';

require('../base');

var StringLine = require('dbjs/lib/types-ext/string/string-line');

StringLine.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) input.setAttribute('maxlength', this.max);
	return new this.DOMInputBox(input);
};

StringLine.prototype.toDOMInput = function (document) {
	var box = this.ns.toDOMInput(document);
	box.set(String(this));
	return box;
};

module.exports = StringLine;
