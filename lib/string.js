'use strict';

var Db         = require('./base')
  , StringType = require('dbjs/lib/types-base/string');

StringType.set('DOMTextareaBox', Db.fixed(function () {
	var Parent, Box, proto;
	Parent = this.DOMInputBox;
	Box = function (document) {
		this.dom = document.createElement('textarea');
		this.dom.appendChild(document.createTextNode(''));
	};
	proto = Box.prototype = Object.create(Parent.prototype);
	proto.constructor = Box;
	proto.set = function (value) {
		if (value == null) {
			this.dom.value = '';
			this.dom.firstChild.data = '';
			return;
		}
		this.dom.value = value;
		this.dom.firstChild.data = value;
	};
	return Box;
}));

StringType.toDOMInputBox = function (document) {
	var box = new this.DOMTextareaBox(document)
	  , dom = box.dom;
	if (this.max) dom.setAttribute('maxlength', this.max);
	return box;
};

module.exports = StringType;
