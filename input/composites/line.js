'use strict';

var separate     = require('es5-ext/array/#/separate')
  , uniq         = require('es5-ext/array/#/uniq')
  , d            = require('d/d')
  , memoize      = require('memoizee/lib/primitive')
  , DOMInput     = require('./_observable')
  , resolveProps = require('esniff/accessed-properties')('this')

  , re = new RegExp('^\\s*function\\s*(?:[\\0-\'\\)-\\uffff]+)*\\s*\\(\\s*' +
	'(_observe[\\/*\\s]*)?\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')
  , Input, resolve;

resolve = memoize(function (fn) {
	return uniq.call(resolveProps(String(fn).match(re)[2]).map(function (data) {
		return data.name;
	}));
});

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var el = this.make, desc = options.dbOptions
		  , triggers = resolve(desc._value_)
		  , object = options.observable.object;

		this.dom = el('div', separate.call(triggers.map(function (name) {
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
