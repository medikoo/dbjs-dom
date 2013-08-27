'use strict';

var sepItems = require('es5-ext/array/#/sep-items')
  , d        = require('es5-ext/object/descriptor')
  , DOMInput = require('./_relation')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var el = this.make, rel = options.dbOptions;

		this.dom = el('div', sepItems.call(rel.triggers.values.map(function (name) {
			return this.get(name);
		}, rel.obj).sort(function (a, b) {
			return a.__order.__value - b.__order.__value;
		}).map(function (rel) {
			var opts = this.getOptions(rel);
			if ((opts.placeholder == null) && rel.__label.__value) {
				opts.placeholder = rel._label;
			}
			return this.addItem(rel.toDOMInput(this.document, opts), rel._id_);
		}, this), (options.sep != null) ? options.sep : ' '));
	})
});
