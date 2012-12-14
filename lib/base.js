'use strict';

var Db       = require('dbjs')
  , Relation = require('dbjs/lib/_internals/relation');

module.exports = Db;

Db.Base.set('toDOMInput');
Db.Base.prototype.set('toDOMInput');
Db.Base.set('DOMInputBox', Db.fixed(function () {
	var DOMInputBox = function (dom) { this.dom = dom; }
	  , proto = DOMInputBox.prototype;
	proto.toDOM = function () { return this.dom; };
	proto.get = function () { return this.dom.value; };
	proto.set = function (value) {
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
	return DOMInputBox;
}));

Relation.prototype.set('toDOMInput', function (document/*, options*/) {
	var dom, value = this.value, options = arguments[1];
	if (value != null) {
		if (typeof value !== 'object') {
			value = Object(value);
			value.__proto__ = this.ns.prototype;
		}
		dom = this.ns.prototype.toDOMInput.call(value, document);
	} else {
		dom = this.ns.toDOMInput(document);
	}
	dom.setAttribute('name', this.name);
	if (this.required) dom.setAttribute('required', true);
	if (options) {
		Object.keys(Object(options)).forEach(function (name) {
			dom.setAttribute(name, options[name]);
		});
	}
	dom.setAttribute('data-dbjsid', this._id_);
	this.on('update', dom.set.bind(dom));
	return dom;
});
