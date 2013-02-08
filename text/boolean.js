'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMText  = require('./_text')
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get

  , Base = Db.Base
  , Text;

Text = function (document, ns, options) {
	this.document = document;
	this.ns = ns;
	this.relation = options && options.relation;
	this.text = new DOMText(document, Base);
	this.dom = this.text.dom;
};

Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, function (value) {
		var rel;
		if (value == null) {
			this.text.dismiss();
			this.text.value = value;
			return;
		}
		if (value.valueOf()) {
			rel = (this.relation && this.relation.__trueLabel.__value) ?
					this.relation._trueLabel : this.ns._trueLabel;
		} else {
			rel = (this.relation && this.relation.__falseLabel.__value) ?
					this.relation._falseLabel : this.ns._falseLabel;
		}
		rel.assignDOMText(this.text);
	})
});

module.exports = Object.defineProperty(Db.Boolean, 'DOMText', d(Text));
