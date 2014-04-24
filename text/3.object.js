'use strict';

var d       = require('d')
  , base    = require('./1.base')

  , defineProperties = Object.defineProperties
  , DOMAttr = base.Attr, DOMText = base.Text
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get
  , getAttrValue =
	Object.getOwnPropertyDescriptor(DOMAttr.prototype, 'value').get
  , Text, Attr, setValue;

Text = function (document, type, options) {
	this.document = document;
	this.type = type;
	this.property = options && options.property;
	this.box = new DOMText(document, type.database.Base);
	this.dom = this.box.dom;
};

Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, setValue = function (value) {
		var observable;
		if (value && this.property) {
			observable = value._get(this.property);
			if (observable.assignDOMText) observable.assignDOMText(this.box);
			else this.box.value = observable;
		} else {
			this.box.dismiss();
			this.box.value = value;
		}
	})
});

Attr = function (document, name, type, options) {
	this.document = document;
	this.type = type;
	this.property = options && options.property;
	this.box = new DOMAttr(document, name, type.database.Base);
	this.dom = this.box.dom;
};

Attr.prototype = Object.create(DOMAttr.prototype, {
	constructor: d(Attr),
	value: d.gs(getAttrValue, setValue)
});

module.exports = exports = function (db) {
	return defineProperties(db.Object, {
		DOMText: d(Text),
		DOMAttr: d(Attr)
	});
};

exports.Attr = Attr;
exports.Text = Text;
