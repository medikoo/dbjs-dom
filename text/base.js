'use strict';

var d  = require('es5-ext/lib/Object/descriptor')
  , Db = require('dbjs')

  , Base = Db.Base;

require('./_attr');
require('./_text');

module.exports = Base;

Object.defineProperties(Base, {
	toDOMText: d(function (document/*, options*/) {
		return new this.DOMText(document, this, arguments[1]);
	}),
	toDOMAttrBox: d(function (document, name/*, options*/) {
		return new this.DOMAttr(document, name, this, arguments[2]);
	}),
});

Object.defineProperties(Base.prototype, {
	toDOMText: d(function (document/*, options*/) {
		var text = new this.ns.toDOMText(document, arguments[1]);
		text.value = this;
		return text;
	}),
	toDOMAttrBox: d(function (document, name/*, options*/) {
		var text = new this.ns.toDOMAttrBox(document, name, arguments[2]);
		text.value = this;
		return text;
	}),
	toDOM: d(function (document/*, options*/) {
		return this.toDOMText(document, arguments[1]).dom;
	}),
	toDOMAttr: d(function (document, name/*, options*/) {
		return this.toDOMAttrBox(document, name, arguments[2]).dom;
	})
});
