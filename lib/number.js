'use strict';

require('./base');

var NumberType = require('dbjs/lib/types-base/number');

NumberType.toDOMInputBox = function (document) {
	var box = this.Base.toDOMInputBox(document)
	  , dom = box.dom;

	dom.setAttribute('type', 'number');
	if (this.max < Infinity) dom.setAttribute('max', this.max);
	if (this.min > -Infinity) dom.setAttribute('min', this.min);
	if (this.step) dom.setAttribute('step', this.step);
	return box;
};
NumberType.prototype.set('toDOMInputBox', function (document) {
	var box = this.ns.toDOMInputBox(document);
	box.set(Number(this));
	return box;
});

module.exports = NumberType;
