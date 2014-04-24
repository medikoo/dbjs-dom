'use strict';

var d       = require('d')
  , memoize = require('memoizee/lib/regular')
  , base    = require('./3.object')
  , setup   = require('./')

  , defineProperties = Object.defineProperties
  , DOMText = base.Text, DOMAttr = base.Attr
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get
  , getAttrValue =
	Object.getOwnPropertyDescriptor(DOMAttr.prototype, 'value').get
  , Text, Attr, setValue;

Text = function (document, type) {
	this.document = document;
	this.type = type;
	this.box = new DOMText(document, type.database.Base);
	this.dom = this.box.dom;
};
Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, setValue = function (value) {
		var meta;
		this.box.dismiss();
		if (value == null) {
			this.box.value = value;
			return;
		}
		meta = this.type.meta;
		if (typeof meta.get === 'function') value = meta.get(value).label;
		else value = (meta[value] && meta[value].label);
		this.box.value = value;
	})
});

Attr = function (document, name, type) {
	this.document = document;
	this.type = type;
	this.box = new DOMAttr(document, name, type.database.Base);
	this.dom = this.box.dom;
};
Attr.prototype = Object.create(DOMAttr.prototype, {
	constructor: d(Attr),
	value: d.gs(getAttrValue, setValue)
});

module.exports = exports = memoize(function (EnumType) {
	setup(EnumType.database);
	return defineProperties(EnumType, {
		DOMText: d(Text),
		DOMAttr: d(Attr)
	});
});

exports.Text = Text;
exports.Attr = Attr;
