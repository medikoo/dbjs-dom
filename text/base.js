'use strict';

var d  = require('es5-ext/lib/Object/descriptor')
  , Db = require('dbjs')

  , Base = Db.Base;

require('./_text');

module.exports = Base;

Object.defineProperty(Base, 'toDOMText', d(function (document) {
	return new this.DOMText(document, this);
}));

Object.defineProperties(Base.prototype, {
	toDOMText: d(function (document) {
		var text = new this.ns.toDOMText(document);
		text.value = this;
		return text;
	}),
	toDOM: d(function (document) {
		return this.toDOMText(document).dom;
	})
});
