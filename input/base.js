'use strict';

var d  = require('es5-ext/lib/Object/descriptor')
  , Db = require('dbjs')

  , Base = Db.Base;

require('./_controls/input');

module.exports = Object.defineProperties(Base, {
	toDOMInput: d(function (document/*, options*/) {
		var box = new this.DOMInput(document, this)
		  , options = arguments[1];

		if (options != null) box.castKnownAttributes(options);
		return box;
	})
});
Object.defineProperty(Base.prototype, 'toDOMInput',
	d(function (document/*, options*/) {
		var box = this.ns.toDOMInput(document, arguments[1]);
		box.value = this;
		return box;
	}));
