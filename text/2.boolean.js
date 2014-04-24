'use strict';

var d    = require('d')
  , base = require('./1.base')

  , defineProperties = Object.defineProperties
  , DOMAttr = base.Attr, DOMText = base.Text
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get
  , getAttrValue =
	Object.getOwnPropertyDescriptor(DOMAttr.prototype, 'value').get
  , Text, Attr, setValue;

Text = function (document, type, options) {
	this.document = document;
	this.type = type;
	this.observable = options && options.observable;
	this.box = new DOMText(document, type.database.Base);
	this.dom = this.box.dom;
};

Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, setValue = function (value) {
		this.box.dismiss();
		if (value == null) {
			this.box.value = value;
			return;
		}
		if (value.valueOf()) {
			this.box.value = this.observable.descriptor.trueLabel ||
				this.type.trueLabel;
		} else {
			this.box.value = this.observable.descriptor.falseLabel ||
				this.type.falseLabel;
		}
	})
});

Attr = function (document, name, type, options) {
	this.document = document;
	this.type = type;
	this.descriptor = options && options.descriptor;
	this.box = new DOMAttr(document, name, type.database.Base);
	this.dom = this.box.dom;
};

Attr.prototype = Object.create(DOMAttr.prototype, {
	constructor: d(Attr),
	value: d.gs(getAttrValue, setValue)
});

module.exports = exports = function (db) {
	return defineProperties(db.Boolean, {
		DOMText: d(Text),
		DOMAttr: d(Attr)
	});
};

exports.Text = Text;
exports.Attr = Attr;
