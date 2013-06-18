'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , d          = require('es5-ext/lib/Object/descriptor')
  , validNode  = require('dom-ext/lib/Node/valid-node')
  , exclude    = require('dom-ext/lib/Node/prototype/_exclude')
  , include    = require('dom-ext/lib/Node/prototype/_include')
  , Base       = require('dbjs').Base
  , relation   = require('dbjs/lib/_relation')
  , DOMValue   = require('./utils/rel-value')

  , defineProperty = Object.defineProperty
  , filterNull = function (value) { return value != null; }
  , filterValue = function (value) { return value == null; };

module.exports = Object.defineProperties(relation, {
	toDOMText: d(function (document/*, options*/) {
		var options = Object(arguments[1]);
		options.relation = this;
		return this.assignDOMText(this.__ns.__value.toDOMText(document, options));
	}),
	toDOMAttrBox: d(function (element/*, name, options*/) {
		var name = arguments[1], options = Object(arguments[2]);
		if (name == null) name = this.name;
		options.relation = this;
		return this.assignDOMText(this.__ns.__value
				.toDOMAttrBox(element, name, options), options);
	}),
	assignDOMText: d(function (text/*, options*/) {
		var listener, options = Object(arguments[1]);
		text.dismiss();
		text.value = (options.bare || (this.ns === Base)) ? this.value :
				this.objectValue;
		this.on('change', listener = function () {
			text.value = (options.bare || (this.ns === Base)) ? this.value :
					this.objectValue;
		});
		text.dismiss = this.off.bind(this, 'change', listener);
		return text;
	}),
	toDOM: d(function (document/*, options*/) {
		var options = arguments[1];
		if (!isFunction(options)) return this.toDOMText(document, options).dom;
		return (new DOMValue(document, this, options)).toDOM();
	}),
	toDOMAttr: d(function (element/*, name, options*/) {
		return this.toDOMAttrBox(element, arguments[1], arguments[2]).dom;
	}),
	lastModifiedDOM: d(function (document) {
		var dom = document.createTextNode(''), onUpdate;
		onUpdate = function () {
			var value = this._lastModifiedDate_;
			dom.data = (value == null) ? '' : value.toLocaleString();
		};
		this.on('change', onUpdate);
		onUpdate.call(this);
		return dom;
	}),
	filterDOM: d(function (dom/*, filter*/) {
		var filter = arguments[1], onchange, value;
		validNode(dom);
		if (filter === undefined) {
			filter = filterNull;
		} else if (filter === null) {
			filter = filterValue;
		} else if (!isFunction(filter)) {
			value = filter;
			filter = function (current) {
				return current === value;
			};
		}
		this.on('change', onchange = function (value) {
			if (filter(value)) include.call(dom);
			else exclude.call(dom);
		});
		if (filter(this.value)) {
			if (dom._domExtLocation) include.call(dom);
			return dom;
		} else {
			exclude.call(dom);
			if (!dom._domExtLocation) {
				defineProperty(dom, '_domExtLocation',
					d(dom.ownerDocument.createTextNode('')));
			}
			return dom._domExtLocation;
		}
	})
});
