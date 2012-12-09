'use strict';

var Email = require('dbjs/lib/types-ext/string/email');

require('../_base');

Email.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'email');
	if (this.max) input.setAttribute('maxlength', this.max);
	if (this.multiple) input.setAttribute('multiple', 'multiple');
	return input;
};

Email.prototype.toDOMInput = function (document) {
	var input = this.ns.createDOM(document);
	input.setAttribute('value', String(this));
	return input;
};

module.exports = Email;
