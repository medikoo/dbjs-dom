'use strict';

var d  = require('d/d')
  , Db = require('dbjs')

  , Text;

module.exports = Text = function (document, ns) {
	this.document = document;
	this.ns = ns;
	this.dom = document.createTextNode('');
};
Object.defineProperties(Text.prototype, {
	toDOM: d(function () { return this.dom; }),
	value: d.gs(function () { return this.dom.data; }, function (value) {
		if (value == null) {
			this.dom.data = '';
			return;
		}
		if (value && value.__toString) value = value.__toString.__value.call(value);
		this.dom.data = value;
	}),
	dismiss: d(function () {})
});

Object.defineProperty(Db.Base, 'DOMText', d(Text));
