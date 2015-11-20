'use strict';

var compact        = require('es5-ext/array/#/compact')
  , separate       = require('es5-ext/array/#/separate')
  , uniq           = require('es5-ext/array/#/uniq')
  , callable       = require('es5-ext/object/valid-callable')
  , d              = require('d')
  , memoize        = require('memoizee/plain')
  , resolveProps   = require('esniff/accessed-properties')('this')
  , metaNames      = require('dbjs/_setup/utils/meta-property-names')
  , resolveOptions = require('../utils/resolve-options')
  , DOMInput       = require('./_observable')

  , getPrototypeOf = Object.getPrototypeOf
  , re = new RegExp('^\\s*function\\s*(?:[\\0-\'\\)-\\uffff]+)*\\s*\\(\\s*' +
		'(_observe[\\/*\\s]*)?\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')
  , Input, resolve;

resolve = memoize(function (fn) {
	return uniq.call(resolveProps(String(fn).match(re)[2]).map(function (data) {
		return data.name;
	}));
});

module.exports = Input = function (document, type/*, options*/) {
	var options = arguments[2];
	this.type = type;
	options = resolveOptions(options, type);
	if (options.render != null) this._render = callable(options.render);
	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var el       = this.make
		  , object   = options.observable.object
		  , triggers = this._resolveTriggers(options);

		this.dom = el('div', { class: 'inputs' },  options.prepend,
			separate.call(compact.call(triggers.map(function (name) {
				if (metaNames[name]) return;
				return this.resolveSKeyPath(name).observable;
			}, object)).map(function (observable) {
				var desc = observable.descriptor, opts = this.getOptions(desc);
				if ((opts.placeholder == null) && desc.label) {
					opts.placeholder = desc.label;
				}
				return this.addItem(observable.toDOMInput(this.document, opts),
					observable.dbId);
			}, this), (options.sep != null) ? options.sep : ' '), options.append);
	}),
	_resolveTriggers: d(function (options) {
		var desc = options.dbOptions
		  , fn   = desc._value_;

		while ((fn !== undefined) && (typeof fn !== 'function')) {
			desc = getPrototypeOf(desc);
			fn = desc._value_;
		}

		return resolve(callable(fn));
	})
});
