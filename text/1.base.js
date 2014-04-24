'use strict';

var isObject     = require('es5-ext/object/is-object')
  , d            = require('d')
  , validElement = require('dom-ext/element/valid-element')

  , defineProperties = Object.defineProperties
  , Attr, Text;

Attr = function (element, name, type) {
	this.element = validElement(element);
	this.name = name;
	this.type = type;
};
defineProperties(Attr.prototype, {
	value: d.gs(function () { return this.element.getAttribute(this.name); },
		function (value) {
			if (value == null) {
				this.element.removeAttribute(this.name);
				return;
			}
			if ((this.type.__id__ !== 'Base') && !isObject(value)) {
				value = new this.type(value);
			}
			this.element.setAttribute(this.name, value);
		}),
	dismiss: d(function () {})
});

Text = function (document, type) {
	this.document = document;
	this.type = type;
	this.dom = document.createTextNode('');
};
Object.defineProperties(Text.prototype, {
	toDOM: d(function () { return this.dom; }),
	value: d.gs(function () { return this.dom.data; }, function (value) {
		if (value == null) {
			this.dom.data = '';
			return;
		}
		if ((this.type.__id__ !== 'Base') && !isObject(value)) {
			value = new this.type(value);
		}
		this.dom.data = value;
	}),
	dismiss: d(function () {})
});

module.exports = exports = function (db) {
	defineProperties(db.Base, {
		DOMAttr: d(Attr),
		DOMText: d(Text),
		toDOMText: d(function (document/*, options*/) {
			return new this.DOMText(document, this, arguments[1]);
		}),
		toDOMAttrBox: d(function (element, name/*, options*/) {
			return new this.DOMAttr(element, name, this, arguments[2]);
		})
	});

	defineProperties(db.Base.prototype, {
		toDOMText: d(function (document/*, options*/) {
			var text = this.constructor.toDOMText(document, arguments[1]);
			text.value = this;
			return text;
		}),
		toDOMAttrBox: d(function (element, name/*, options*/) {
			var text = this.constructor.toDOMAttrBox(element, name, arguments[2]);
			text.value = this;
			return text;
		}),
		toDOM: d(function (document/*, options*/) {
			return this.toDOMText(document, arguments[1]).dom;
		}),
		toDOMAttr: d(function (element, name/*, options*/) {
			return this.toDOMAttrBox(element, name, arguments[2]).dom;
		})
	});

	return db.Base;
};
exports.Attr = Attr;
exports.Text = Text;
