'use strict';

var Db       = require('../')
  , DateType = require('dbjs-ext/date-time/date');

module.exports = DateType;

DateType.set('DOMInputBox', Db.external(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.call(this, document, ns);
		this.dom.setAttribute('type', 'date');
		if (ns.max) this.setAttribute('max', ns.max);
		if (ns.min) this.setAttribute('min', ns.min);
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
		this.dom.setAttribute('value',
			this.dom.value = value.toISOString().slice(0, 10));
	};
	proto.setAttribute = function (name, value) {
		if ((name === 'min') || (name === 'max')) {
			this.dom.setAttribute(name, value.toISOString().slice(0, 10));
		} else {
			Parent.prototype.setAttribute.call(this, name, value);
		}
	};
	return Box;
}));

DateType.fromDOMInputValue = function (value) {
	return this.normalize((value && value.getTime) ? value :
			new Date(Date.parse(value)));
};
