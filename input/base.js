'use strict';

var d  = require('es5-ext/lib/Object/descriptor')
  , Db = require('dbjs')

  , Base = Db.Base;

require('./_controls/input');
require('./_multiple');

module.exports = Object.defineProperties(Base, {
	unserializeDOMInputValue: d(function (value) {
		return (value == null) ? null : String(value).trim();
	}),
	toDOMInput: d(function (document/*, options*/) {
		var box, options = Object(arguments[1]);
		if (options.multiple) {
			return new this.DOMMultipleInput(document, this, options);
		}
		box = new this.DOMInput(document, this, options);
		return box;
	})
});
Object.defineProperty(Base.prototype, 'toDOMInput',
	d(function (document/*, options*/) {
		var box = this.ns.toDOMInput(document, arguments[1]);
		box.value = this;
		return box;
	}));
