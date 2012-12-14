'use strict';

var Db       = require('dbjs')
  , Relation = require('dbjs/lib/_internals/relation')

  , toDOM;

module.exports = Db;

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

Db.Base.set('toDOMInputBox', function (document) {
	return new this.DOMInputBox(document.createElement('input'));
});
Db.Base.prototype.set('toDOMInputBox', function (document) {
	var box = this.ns.toDOMInputBox(document);
	box.set(String(this));
	return box;
});
Db.Base.prototype.set('toDOMInput', toDOM = function (document, options) {
	return this.toDOMInputBox(document, options).dom;
});

Relation.prototype.set('toDOMInputBox', function (document/*, options*/) {
	var box, value = this.value, options = arguments[1];
	if (value != null) {
		if (typeof value !== 'object') {
			value = Object(value);
			value.__proto__ = this.ns.prototype;
		}
		box = this.ns.prototype.toDOMInputBox.call(value, document);
	} else {
		box = this.ns.toDOMInputBox(document);
	}
	box.setAttribute('name', this.name);
	if (this.required) box.setAttribute('required', true);
	if (options) {
		Object.keys(Object(options)).forEach(function (name) {
			box.setAttribute(name, options[name]);
		});
	}
	box.setAttribute('data-dbjsid', this._id_);
	this.on('update', box.set.bind(box));
	return box;
});
Relation.prototype.set('toDOMInput', toDOM);
