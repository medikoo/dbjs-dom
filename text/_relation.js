'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , relation  = require('dbjs/lib/_relation');

module.exports = Object.defineProperties(relation, {
	toDOMText: d(function (document/*, options*/) {
		var options = Object(arguments[1]);
		options.relation = this;
		return this.assignDOMText(this.__ns.__value.toDOMText(document, options));
	}),
	toDOMAttrBox: d(function (document/*, name, options*/) {
		var name = arguments[1], options = Object(arguments[2]);
		if (name == null) name = this.name;
		options.relation = this;
		return this.assignDOMText(this.__ns.__value
				.toDOMAttrBox(document, name, options));
	}),
	assignDOMText: d(function (text) {
		var listener;
		text.dismiss();
		text.value = this.objectValue;
		this.on('change', listener = function () {
			text.value = this.objectValue;
		});
		text.dismiss = this.off.bind(this, 'change', listener);
		return text;
	}),
	toDOM: d(function (document/*, options*/) {
		return this.toDOMText(document, arguments[1]).dom;
	}),
	toDOMAttr: d(function (document/*, name, options*/) {
		return this.toDOMAttrBox(document, arguments[1], arguments[2]).dom;
	})
});
