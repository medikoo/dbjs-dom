'use strict';

var Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation')

  , toDOM;

module.exports = Db;

Db.Base.set('DOMBox', Db.external(function () {
	var Box, proto;
	Box = function (document, ns) {
		this.document = document;
		this.ns = ns;
		this.dom = document.createTextNode('');
	};
	proto = Box.prototype;
	proto.toDOM = function () { return this.dom; };
	proto.get = function () { return this.dom.data; };
	proto.set = function (value) {
		if (value == null) {
			this.dom.data = '';
			return;
		}
		this.dom.data = value;
	};
	return Box;
}));

Db.Base.set('toDOMBox', function (document) {
	return new this.DOMBox(document, this);
});
Db.Base.set('toDOM', function (document) {
	return this.toDOMBox(document).dom;
});
Db.Base.prototype.set('toDOMBox', function (document) {
	var box = this.ns.toDOMBox(document);
	box.set(this);
	return box;
});
Db.Base.prototype.set('toDOM', toDOM = function (document) {
	return this.toDOMBox(document).dom;
});

relation.set('toDOMBox', function (document) {
	var box, dom;
	box = this.ns.toDOMBox(document, this.ns);
	box.set(this.objectValue);
	dom = box.dom;
	if (dom.setAttribute) dom.setAttribute('data-dbjsid', this._id_);
	this.on('update', function () { box.set(this.objectValue); });
	return box;
});
relation.set('toDOM', toDOM);
