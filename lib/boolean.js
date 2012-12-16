'use strict';

var Db          = require('./base')
  , BooleanType = require('dbjs/lib/types-base/boolean');

require('./dom-radio-box');

BooleanType.set('DOMInputBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMRadioBox;
	Box = function (document, ns) {
		Parent.call(this, document, ns);
		this.dom.appendChild(this.createOption('1',
			ns._trueString.toDOM(document)));
		this.dom.appendChild(document.createTextNode(' '));
		this.dom.appendChild(this.createOption('0',
			ns._falseString.toDOM(document)));
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if (value != null) value = (value && value.valueOf()) ? '1' : '0';
		Parent.prototype.set.call(this, value);
	};
	return Box;
}));
BooleanType.set('DOMCheckboxBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMInputBox;
	Box = function (document, ns) {
		Parent.apply(this, arguments);
		this.dom.setAttribute('type', 'checkbox');
		this.dom.setAttribute('value', '1');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if ((value == null) || !value.valueOf()) {
			this.dom.removeAttribute('checked');
			this.checked = false;
		} else {
			this.dom.setAttribute('checked', 'checked');
			this.checked = true;
		}
	};
	return Box;
}));
BooleanType.set('toDOMInputBox', function (document, options) {
	var box;
	if (options && (options.type === 'checkbox')) {
		box = new this.DOMCheckboxBox(document, this);
	} else {
		box = new this.DOMInputBox(document, this);
	}
	if (options) {
		Object.keys(Object(options)).forEach(function (name) {
			if (name === 'type') return;
			box.setAttribute(name, options[name]);
		});
	}
	return box;
});
BooleanType.fromDOMInputValue = function (value) {
	return (value === '1') ? true : false;
};

BooleanType.set('DOMBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.Base.DOMBox;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.dom = document.createElement('span');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		var label;
		if (this.dom.firstChild) this.dom.removeChild(this.dom.firstChild);
		label = this.ns[value.valueOf() ? '_trueString' : '_falseString'];
		this.dom.appendChild(label.toDOM(this.document));
	};
	return Box;
}));

module.exports = BooleanType;
