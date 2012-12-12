'use strict';

var UInteger = require('dbjs/lib/types-ext/number/integer/u-integer');

require('../../_base');

UInteger.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('step', '1');
	if (this.max < Infinity) input.setAttribute('max', this.max);
	if (this.min > -Infinity) input.setAttribute('min', this.min);
	return input;
};

UInteger.prototype.toDOMInput = function (document) {
	var input = this.ns.toDOMInput(document);
	input.setAttribute('value', Number(this));
	return input;
};

module.exports = UInteger;
