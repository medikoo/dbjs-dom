'use strict';

var compact = require('es5-ext/lib/Array/prototype/compact')
  , copy    = require('es5-ext/lib/Object/copy')
  , d       = require('es5-ext/lib/Object/descriptor')
  , extend  = require('es5-ext/lib/Object/extend')
  , el      = require('dom-ext/lib/Document/prototype/make-element')
  , Db      = require('../')

  , map = Array.prototype.map
  , Base = Db.Base, FunctionType = Db.Function
  , Fieldset;

require('./fieldset-item');

module.exports = Fieldset = function (document, obj/*, options*/) {
	var options = Object(arguments[2]), names;

	this.document = document;
	this.obj = obj;

	if (options.names != null) names = options.names;
	else names = obj.getPropertyNames(options.tag);

	this.items = compact.call(map.call(names, function (name) {
		var rel = obj['_' + name];
		return ((rel.ns === Base) || (rel.ns === FunctionType)) ? null : rel;
	})).sort(function (relA, relB) {
		return relA.order - relB.order;
	}).map(function (rel) {
		var controlOpts;
		if (options.control) controlOpts = copy(options.control);
		if (options.controls && options.controls[rel.name]) {
			controlOpts = extend(Object(controlOpts), options.controls[rel.name]);
		}
		return rel.toDOMFieldsetItem(document, controlOpts);
	});

	this.build();
	this.dom.classList.add('dbjs');
};

Object.defineProperties(Fieldset.prototype, {
	build: d(function () {
		el = el.bind(this.document);
		this.dom = el('fieldset', el('table',
			this.domItems = el('tbody', this.items)));
	}),
	toDOM: d(function () { return this.dom; })
});

Object.defineProperty(Base, 'DOMFieldset', d(Fieldset));

Object.defineProperty(Db.prototype, 'toDOMFieldset',
	d(function (document/*, options*/) {
		return new Base.DOMFieldset(document, this, arguments[1]);
	}));
