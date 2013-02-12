'use strict';

var d  = require('es5-ext/lib/Object/descriptor')
  , Db = require('dbjs')

  , Attr;

module.exports = Attr = function (document, name, ns) {
	this.document = document;
	this.ns = ns;
	this.dom = document.createAttribute(name);
};
Object.defineProperties(Attr.prototype, {
	toDOM: d(function () { return this.dom; }),
	value: d.gs(function () { return this.dom.value; }, function (value) {
		if (value == null) {
			this.dom.value = '';
			return;
		}
		if (value && value.__toString) value = value.__toString.__value.call(value);
		this.dom.value = value;
	}),
	dismiss: d(function () {})
});

Object.defineProperty(Db.Base, 'DOMAttr', d(Attr));
