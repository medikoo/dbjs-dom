'use strict';

var Db          = require('./base')
  , BooleanType = require('dbjs/lib/types-base/boolean');

require('./dom-radio-box');

BooleanType.setProperties({
	DOMBooleanRadioBox: Db.fixed(function () {
		var Parent, Box, proto;
		Parent = this.DOMRadioBox;
		Box = function (document, ns) {
			Parent.call(this, document);
			this.dom.appendChild(this.createItem('1', ns._trueLabel.toDOM(document)));
			this.dom.appendChild(document.createTextNode(' '));
			this.dom.appendChild(this.createItem('0',
				ns._falseLabel.toDOM(document)));
		};
		proto = Box.prototype = Object.create(Parent.prototype);
		proto.constructor = Box;
		proto.set = function (value) {
			if (value != null) value = (value && value.valueOf()) ? '1' : '0';
			Parent.prototype.set.call(this, value);
		};
		return Box;
	}),
	trueLabel: 'True',
	falseLabel: 'False'
});

BooleanType.toDOMInputBox = function (document) {
	return new this.DOMBooleanRadioBox(document, this);
};

BooleanType.set('DOMBooleanBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.DOMBox;
	Box = function (document) {
		this.document = document;
		this.dom = document.createElement('span');
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		var label;
		if (this.dom.firstChild) this.dom.removeChild(this.dom.firstChild);
		label = value.ns[value.valueOf() ? '_trueLabel' : '_falseLabel'];
		this.dom.appendChild(label.toDOM(this.document));
	};
	return Box;
}));

BooleanType.toDOMBox = function (document) {
	return new this.DOMBooleanBox(document);
};

module.exports = BooleanType;
