'use strict';

var Db = require('./base');

var StringType = require('dbjs/lib/types-base/string');

StringType.toDOM = function (document) {
	return new this.DOMBox(document.createTextNode(''));
};
StringType.prototype.toDOM = function (document) {
	var box = this.ns.toDOM(document);
	box.set(String(this));
	return box;
};

StringType.set('DOMTextareaBox', Db.fixed(function () {
	var DOMTextareaBox = function (dom) { this.dom = dom; }
	  , proto = DOMTextareaBox.prototype;
	proto = Object.create(this.DOMInputBox);
	proto.set = function (value) {
		this.dom.value = value;
		this.dom.firstChild.data = value;
	};
	return DOMTextareaBox;
}));
StringType.toDOMInput = function (document) {
	var textarea = document.createElement('textarea');
	if (this.max) textarea.setAttribute('maxlength', this.max);
	return new this.DOMTextareaBox(textarea);
};

StringType.prototype.toDOMInput = function (document) {
	var box = this.ns.toDOMInput(document);
	box.set(String(this));
	return box;
};

module.exports = StringType;
