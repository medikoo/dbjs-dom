'use strict';

var Db       = require('dbjs')
  , Relation = require('dbjs/lib/_internals/relation');

module.exports = Db;

Db.Base.set('DOMInputBox', Db.fixed(function () {
	var Box, proto;
	Box = function (document) { this.dom = document.createElement('input'); };
	proto = Box.prototype;
	proto.toDOM = function () { return this.dom; };
	proto.get = function () { return this.dom.value; };
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

Db.Base.set('toDOMInputBox', function (document) {
	return new this.DOMInputBox(document);
});
Db.Base.prototype.set('toDOMInputBox', function (document) {
	var box = this.ns.toDOMInputBox(document);
	box.set(this);
	return box;
});
Db.Base.prototype.set('toDOMInput', function (document) {
	return this.toDOMInputBox(document).dom;
});

Relation.prototype.set('toDOMInputBox', function (document/*, options*/) {
	var box, options = arguments[1];
	box = this.ns.toDOMInputBox(document);
	box.set(this._objectValue_);
	box.setAttribute('name', this.name);
	if (this.required) box.setAttribute('required', true);
	if (options) {
		Object.keys(Object(options)).forEach(function (name) {
			box.setAttribute(name, options[name]);
		});
	}
	box.setAttribute('data-dbjsid', this._id_);
	this.on('update', function () { box.set(this._objectValue_); });
	return box;
});
Relation.prototype.set('toDOMInput', function (document, options) {
	return this.toDOMInputBox(document, options).dom;
});
