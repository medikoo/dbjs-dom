'use strict';

var UsDollar = require('dbjs/lib/types-ext/number/currency/us-dollar');

require('../../_base');

UsDollar.toDOMInput = function (document) {
	var input = document.createElement('input');
	input.setAttribute('type', 'number');
	input.setAttribute('step', '0.01');
	if (this.max < Infinity) input.setAttribute('max', this.max);
	if (this.min > -Infinity) input.setAttribute('min', this.min);
	input.setAttribute('data-dbjsid', this._id_);
	return input;
};

UsDollar.prototype.toDOMInput = function (document) {
	var input = this.ns.toDOMInput(document);
	input.setAttribute('value', Number(this));
	input.setAttribute('data-dbjsid', this._id_);
	return input;
};

module.exports = UsDollar;
