'use strict';

var sepItems        = require('es5-ext/array/#/sep-items')
  , d               = require('d/d')
  , DOMInput        = require('./_observable')
  , resolveTriggers = require('dbjs/_setup/utils/resolve-static-triggers')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var el = this.make, desc = options.dbOptions
		  , triggers = resolveTriggers(desc._value_)
		  , object = this.observable.object;

		this.dom = el('div', sepItems.call(triggers.map(function (name) {
			return this._get(name);
		}, object).map(function (observable) {
			var desc = observable.descriptor, opts = this.getOptions(desc);
			if ((opts.placeholder == null) && desc.label) {
				opts.placeholder = desc.label;
			}
			return this.addItem(observable.toDOMInput(this.document, opts),
				observable.dbId);
		}, this), (options.sep != null) ? options.sep : ' '));
	})
});
