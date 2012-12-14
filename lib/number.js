'use strict';

require('./base');

var NumberType = require('dbjs/lib/types-base/number');

NumberType.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	if (this.max < Infinity) input.setAttribute('max', this.max);
	if (this.min > -Infinity) input.setAttribute('min', this.min);
	if (this.step) input.setAttribute('step', this.step);
	return new this.DOMInputBox(input);
};

NumberType.prototype.toDOMInput = function (document) {
	var box = this.ns.toDOMInput(document);
	box.set(Number(this));
	return box;
};

module.exports = NumberType;
