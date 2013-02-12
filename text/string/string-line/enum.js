'use strict';

var d    = require('es5-ext/lib/Object/descriptor')
  , Db   = require('../../')
  , Enum = require('dbjs/lib/objects')._get('Enum')

  , DOMText = Db.DOMText, DOMAttr = Db.DOMAttr, Base = Db.Base
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get
  , getAttrValue =
	Object.getOwnPropertyDescriptor(DOMAttr.prototype, 'value').get
  , Text, Attr, setValue;

Text = function (document, ns) {
	this.document = document;
	this.ns = ns;
	this.box = new DOMText(document, Base);
	this.dom = this.box.dom;
};
Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, setValue = function (value) {
		if (value == null) {
			this.box.dismiss();
			this.box.value = value;
			return;
		}
		this.ns.options.getItem(value)._label.assignDOMText(this.box);
	})
});

Attr = function (document, name, ns) {
	this.document = document;
	this.ns = ns;
	this.box = new DOMAttr(document, name, Base);
	this.dom = this.box.dom;
};
Attr.prototype = Object.create(DOMAttr.prototype, {
	constructor: d(Attr),
	value: d.gs(getAttrValue, setValue)
});

module.exports = Object.defineProperties(Enum, {
	DOMText: d(Text),
	DOMAttr: d(Attr)
});
