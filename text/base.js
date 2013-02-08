'use strict';

var d  = require('es5-ext/lib/Object/descriptor')
  , Db = require('dbjs')

  , Base = Db.Base;

require('./_text');

module.exports = Base;

Object.defineProperty(Base, 'toDOMText', d(function (document/*, options*/) {
	return new this.DOMText(document, this, arguments[1]);
}));

Object.defineProperties(Base.prototype, {
	toDOMText: d(function (document/*, options*/) {
		var text = new this.ns.toDOMText(document, arguments[1]);
		text.value = this;
		return text;
	}),
	toDOM: d(function (document/*, options*/) {
		return this.toDOMText(document, arguments[1]).dom;
	})
});
