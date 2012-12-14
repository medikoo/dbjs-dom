'use strict';

var Db         = require('./base')
  , NumberType = require('dbjs/lib/types-base/number');

NumberType.set('DOMInputNumberBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.DOMInputBox;
	Box = function (document) {
		Parent.call(this, document);
		this.dom.setAttribute('type', 'number');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if (value == null) {
			this.dom.value = '';
			this.dom.removeAttribute('value');
			return;
		}
		value = Number(value);
		this.dom.value = value;
		this.dom.setAttribute('value', value);
	};
	return Box;
}));

NumberType.toDOMInputBox = function (document) {
	var box = new this.DOMInputNumberBox(document)
	  , dom = box.dom;

	if (this.max < Infinity) dom.setAttribute('max', this.max);
	if (this.min > -Infinity) dom.setAttribute('min', this.min);
	if (this.step) dom.setAttribute('step', this.step);
	return box;
};

module.exports = NumberType;
