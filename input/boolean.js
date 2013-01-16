'use strict';

var Db = require('dbjs')

  , BooleanType = module.exports = Db.Boolean;

require('./_controls/radio');

BooleanType.set('DOMInputBox', Db.external(function () {
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
BooleanType.set('DOMCheckboxBox', Db.external(function () {
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
