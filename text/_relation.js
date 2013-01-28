'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , relation = require('dbjs/lib/_relation');

module.exports = Object.defineProperties(relation, {
	toDOMText: d(function (document) {
		return this.assignDOMText(this.__ns.__value.toDOMText(document));
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
	toDOM: d(function (document) {
		return this.toDOMText(document).dom;
	})
});
