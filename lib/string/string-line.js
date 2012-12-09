'use strict';

var StringLine = require('dbjs/lib/types-ext/string/string-line');

require('../_base');

StringLine.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) input.setAttribute('maxlength', this.max);
	input.setAttribute('data-dbjsid', this._id_);
	return input;
};

StringLine.prototype.toDOMInput = function (document) {
	var input = this.ns.createDOM(document);
	input.setAttribute('value', String(this));
	input.setAttribute('data-dbjsid', this._id_);
	return input;
};

module.exports = StringLine;
