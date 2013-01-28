'use strict';

var d    = require('es5-ext/lib/Object/descriptor')
  , Db   = require('../../')
  , Enum = require('dbjs/lib/objects')._get('Enum')

  , DOMText = Db.DOMText, Base = Db.Base
  , getValue = Object.getOwnPropertyDescriptor(DOMText.prototype, 'value').get
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
		this.ns.options.getItem(value)._label.assignDOMText(this.text);
	})
});

module.exports = Object.defineProperty(Enum, 'DOMText', d(Text));
