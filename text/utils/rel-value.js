'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , extend  = require('es5-ext/lib/Object/extend')
  , memoize = require('memoizee/lib/regular')
  , remove  = require('dom-ext/lib/Element/prototype/remove')

  , isArray = Array.isArray
  , DOM;

require('memoizee/lib/ext/method');

DOM = module.exports = function (document, rel, cb) {
	var value;
	this.document = document;
	this.rel = rel;
	this.cb = cb;
	this.location = document.createTextNode('');
	value = rel.value;
	this.current = (value != null) ? this.render(value) : this.location;
	rel.on('change', this.update.bind(this));
};

Object.defineProperties(DOM.prototype, extend({
	update: d(function () {
		var parent, value = this.rel.value
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
}, memoize(function (value) { return this.cb(value); },
	 { method: 'render' })));
