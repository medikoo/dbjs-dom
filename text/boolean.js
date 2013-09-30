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
	this.relation = options && options.relation;
	this.box = new DOMText(document, Base);
	this.dom = this.box.dom;
};

Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, setValue = function (value) {
		var rel;
		if (value == null) {
			this.box.dismiss();
			this.box.value = value;
			return;
		}
		if (value.valueOf()) {
			rel = (this.relation && this.relation.__trueLabel.__value) ?
					this.relation._trueLabel : this.ns._trueLabel;
		} else {
			rel = (this.relation && this.relation.__falseLabel.__value) ?
					this.relation._falseLabel : this.ns._falseLabel;
		}
		rel.assignDOMText(this.box);
	})
});

Attr = function (document, name, ns, options) {
	this.document = document;
	this.ns = ns;
	this.relation = options && options.relation;
	this.box = new DOMAttr(document, name, Base);
	this.dom = this.box.dom;
};

Attr.prototype = Object.create(DOMAttr.prototype, {
	constructor: d(Attr),
	value: d.gs(getAttrValue, setValue)
});

module.exports = Object.defineProperties(Db.Boolean, {
	DOMText: d(Text),
	DOMAttr: d(Attr)
});
