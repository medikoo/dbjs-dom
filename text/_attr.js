'use strict';

var d            = require('d/d')
  , validElement = require('dom-ext/element/valid-element')
  , Db           = require('dbjs')

  , Attr;

module.exports = Attr = function (element, name, ns) {
	this.element = validElement(element);
	this.name = name;
	this.ns = ns;
};
Object.defineProperties(Attr.prototype, {
	value: d.gs(function () { return this.element.getAttribute(this.name); },
		function (value) {
			if (value == null) {
				this.element.removeAttribute(this.name);
				return;
			}
			if (value && value.__toString) {
				value = value.__toString.__value.call(value);
			}
			this.element.setAttribute(this.name, value);
		}),
	dismiss: d(function () {})
});

Object.defineProperty(Db.Base, 'DOMAttr', d(Attr));
