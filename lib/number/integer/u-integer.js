'use strict';

require('../../number');

var UInteger = require('dbjs/lib/types-ext/number/integer/u-integer');

UInteger.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('step', '1');
	if (this.max < Infinity) input.setAttribute('max', this.max);
	if (this.min > -Infinity) input.setAttribute('min', this.min);
	return new this.DOMInputBox(input);
};

module.exports = UInteger;
