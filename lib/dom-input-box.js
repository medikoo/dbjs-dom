'use strict';

var Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation');

module.exports = Db;

Db.Base.set('DOMInputBox', Db.external(function () {
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
Db.Base.set('toDOMInputBox', function (document, options) {
	var box = new this.DOMInputBox(document, this);
	if (options) {
		Object.keys(Object(options)).forEach(function (name) {
			if (name === 'type') return;
			box.setAttribute(name, options[name]);
		});
	}
	return box;
});
Db.Base.prototype.set('toDOMInputBox', function (document, options) {
	var box = this.ns.toDOMInputBox(document, options);
	box.set(this);
	return box;
});
Db.Base.prototype.set('toDOMInput', function (document, options) {
	return this.toDOMInputBox(document, options).dom;
});
Db.Base.set('fromDOMInputValue', function (value) {
	return value;
});

relation.set('toDOMInputBox', function (document/*, options*/) {
	var box, options = arguments[1];
	box = this.ns.toDOMInputBox(document, options);
	box.set(this._objectValue_);
	box.setAttribute('name', this._id_);
	if (this.required && (!options || (options.type !== 'checkbox'))) {
		box.setAttribute('required', true);
	}
	this.on('update', function () { box.set(this._objectValue_); });
	return box;
});
relation.set('toDOMInput', function (document, options) {
	return this.toDOMInputBox(document, options).dom;
});
