'use strict';

var Db = require('dbjs')

  , Base = module.exports = Db.Base;

Base.set('DOMInputBox', Db.external(function () {
	var Box, proto;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.dom = document.createElement('input');
	};
	proto = Box.prototype;
	proto.toDOM = function () { return this.dom; };
	proto.get = function () {
		return this.ns.fromDOMInputValue(this.dom.value);
	};
	proto.set = function (value) {
		if (value == null) {
			this.dom.value = '';
			this.dom.removeAttribute('value');
			return;
		}
		this.dom.value = value;
		this.dom.setAttribute('value', value);
	};
	proto.setAttribute = function (name, value) {
		if (typeof value === 'function') {
			this.dom.setAttribute(name, name);
			this.dom[name] = value;
		} else if ((value == null) || (typeof value === 'boolean')) {
			if (value) {
				this.dom.setAttribute(name, name);
			} else {
				this.dom.removeAttribute(name);
				delete this.dom[name];
			}
		} else {
			this.dom.setAttribute(name, value);
		}
	};
	return Box;
}));
Base.set('allowedDOMInputAttrs', Db.StringLine.rel({
	value: ['class', 'id', 'style'],
	multiple: true
}));
Base.set('toDOMInputBox', function (document/*, options*/) {
	var box = new this.DOMInputBox(document, this)
	  , options = arguments[1];

	if (options != null) {
		Object.keys(Object(options)).forEach(function (name) {
			if ((name.indexOf('data-') === 0) ||
					this.allowedDOMInputAttrs.has(name)) {
				box.setAttribute(name, options[name]);
			}
		}, this);
	}
	return box;
});
Base.prototype.set('toDOMInputBox', function (document/*, options*/) {
	var ns, toBox, box;
	ns = this.__ns.__value;
	toBox = ns.__toDOMInputBox.__value;
	box = toBox.call(ns, document, arguments[1]);
	box.set(this);
	return box;
});
Base.prototype.set('toDOMInput', function (document/*, options*/) {
	return this.__toDOMInputBox.__value.call(this, document, arguments[1]).dom;
});
Base.set('fromDOMInputValue', function (value) { return value; });
