'use strict';

require('../../number');

var UsDollar = require('dbjs/lib/types-ext/number/currency/us-dollar');

UsDollar.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('step', '0.01');
	if (this.max < Infinity) input.setAttribute('max', this.max);
	if (this.min > -Infinity) input.setAttribute('min', this.min);
	return new this.DOMInputBox(input);
};

module.exports = UsDollar;
