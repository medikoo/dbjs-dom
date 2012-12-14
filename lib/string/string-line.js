'use strict';

require('../string');

var StringLine = require('dbjs/lib/types-ext/string/string-line');

StringLine.toDOMInputBox = function (document) {
	var box = this.Base.toDOMInputBox(document)
	  , dom = box.dom;

	dom.setAttribute('type', 'text');
	dom.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) dom.setAttribute('maxlength', this.max);
	return box;
};

module.exports = StringLine;
