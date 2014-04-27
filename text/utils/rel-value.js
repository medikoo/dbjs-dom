'use strict';

var assign         = require('es5-ext/object/assign')
  , d              = require('d')
  , memoizeMethods = require('memoizee/methods-plain')
  , remove         = require('dom-ext/element/#/remove')

  , isArray = Array.isArray
  , DOM;

DOM = module.exports = function (document, observable, cb) {
	var value;
	this.document = document;
	this.observable = observable;
	this.cb = cb;
	this.location = document.createTextNode('');
	value = observable.value;
	this.current = (value != null) ? this.render(value) : this.location;
	observable.on('change', this.update.bind(this));
};

Object.defineProperties(DOM.prototype, assign({
	update: d(function () {
		var parent, value = this.observable.value
		  , dom = (value != null) ? this.render(value) : this.location;
		if (dom === this.current) return;
		if (isArray(this.current)) {
			this.current.forEach(function (node) { remove.call(node); });
		} else if ((this.current != null) && (this.current !== this.location)) {
			remove.call(this.current);
		}
		this.current = dom;
		if (dom === this.location) return;
		if (dom == null) return;
		parent = this.location.parentNode;
		if (isArray(dom)) {
			dom.forEach(function (node) {
				parent.insertBefore(node, this.location);
			}, this);
		} else {
			parent.insertBefore(dom, this.location);
		}
	}),
	toDOM: d(function () {
		var df;
		if ((this.current == null) || (this.current === this.location)) {
			return this.current;
		}
		df = this.document.createDocumentFragment();
		if (isArray(this.current)) this.current.forEach(df.appendChild, df);
		else df.appendChild(this.current);
		df.appendChild(this.location);
		return df;
	})
}, memoizeMethods({
	render: d(function (value) { return this.cb(value); },
		{ getNormalizer: require('memoizee/normalizers/get-1') })
})));
