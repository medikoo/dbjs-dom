'use strict';

var d       = require('d/d')
  , Db      = require('dbjs')
  , DOMAttr = require('./_attr')
  , DOMText = require('./_text')

  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get
  , getAttrValue =
	Object.getOwnPropertyDescriptor(DOMAttr.prototype, 'value').get
  , Base = Db.Base
  , Text, Attr, setValue;

Text = function (document, ns, options) {
	this.document = document;
	this.ns = ns;
	this.property = options && options.property;
	this.box = new DOMText(document, Base);
	this.dom = this.box.dom;
};

Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, setValue = function (value) {
		if (value && this.property) {
			value.get(this.property).assignDOMText(this.box);
		} else {
			this.box.dismiss();
			this.box.value = value;
		}
	})
});

Attr = function (document, name, ns, options) {
	this.document = document;
	this.ns = ns;
	this.property = options && options.property;
	this.box = new DOMAttr(document, name, Base);
	this.dom = this.box.dom;
};

Attr.prototype = Object.create(DOMAttr.prototype, {
	constructor: d(Attr),
	value: d.gs(getAttrValue, setValue)
});

module.exports = Object.defineProperties(Db.Object, {
	DOMText: d(Text),
	DOMAttr: d(Attr)
});
