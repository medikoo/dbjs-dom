'use strict';

var Db         = require('./base')
  , NumberType = require('dbjs/lib/types-base/number');

NumberType.set('DOMInputBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.call(this, document, ns);
		this.dom.setAttribute('type', 'number');
		if (ns.max < Infinity) this.dom.setAttribute('max', ns.max);
		if (ns.min > -Infinity) this.dom.setAttribute('min', ns.min);
		if (ns.step) this.dom.setAttribute('step', ns.step);
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
NumberType.fromDOMInputValue = function (value) { return Number(value); };

module.exports = NumberType;
