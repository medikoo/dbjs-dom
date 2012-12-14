'use strict';

var Db = require('./base');

var StringType = require('dbjs/lib/types-base/string');

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

StringType.toDOMInputBox = function (document) {
	var textarea = document.createElement('textarea');
	if (this.max) textarea.setAttribute('maxlength', this.max);
	return new this.DOMTextareaBox(textarea);
};

module.exports = StringType;
