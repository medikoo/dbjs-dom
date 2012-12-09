'use strict';

var Password = require('dbjs/lib/types-ext/string/password');

require('../_base');

Password.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'password');
	input.setAttribute('pattern', this.pattern.source.slice(1, -1));
	if (this.max) input.setAttribute('maxlength', this.max);
	input.setAttribute('data-dbjsid', this._id_);
	return input;
};

Password.prototype.toDOMInput = function (document) {
	var input = this.ns.createDOM(document);
	input.setAttribute('value', String(this));
	input.setAttribute('data-dbjsid', this._id_);
	return input;
};

module.exports = Password;
