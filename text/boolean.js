'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMText  = require('./_text')
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get

  , Base = Db.Base
  , Text;

Text = function (document, ns) {
	this.document = document;
	this.ns = ns;
	this.text = new DOMText(document, Base);
	this.dom = this.text.dom;
};

Text.prototype = Object.create(DOMText.prototype, {
	constructor: d(Text),
	value: d.gs(getValue, function (value) {
		this.ns[value.valueOf() ? '_trueLabel' : '_assignDOMText']
			.assignDOMText(this.text);
	})
});

module.exports = Object.defineProperty(Db.Boolean, 'DOMText', d(Text));
