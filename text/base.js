'use strict';

var Db = require('dbjs')

  , Base = module.exports = Db.Base;

// Constructor
Base.set('DOMBox', Db.external(function () {
	var Box, proto;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.dom = document.createTextNode('');
	};
	proto = Box.prototype;
	proto.toDOM = function () { return this.dom; };
	proto.get = function () { return this.dom.data; };
	proto.set = function (value) {
		if (value == null) {
			this.dom.data = '';
			return;
		}
		if (value && value.__toString) value = value.__toString.__value.call(value);
		this.dom.data = value;
	};
	proto.dismiss = function () {};
	return Box;
}));
Base.set('toDOMBox', function (document) {
	return new this.DOMBox(document, this);
});
Base.set('toDOM', function (document) {
	return this.toDOMBox(document).dom;
});

// Prototype
Base.prototype.set('toDOMBox', function (document) {
	var box = this.ns.toDOMBox(document);
	box.set(this);
	return box;
});
Base.prototype.set('toDOM', function (document) {
	return this.__toDOMBox.__value.call(this, document).dom;
});
