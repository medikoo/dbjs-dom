'use strict';

var Password = require('dbjs/lib/types-ext/string/password');

require('../_base');

Password.toDOM = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'password');
	input.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) input.setAttribute('maxlength', this.max);
	return input;
};

Password.prototype.toDOM = function (document) {
	var input = this.ns.createDOM(document);
	input.setAttribute('value', String(this));
	return input;
};

module.exports = Password;
