'use strict';

var Db       = require('dbjs')
  , Relation = require('dbjs/lib/_internals/relation')

  , toDOM;

module.exports = Db;

Db.Base.set('DOMBox', Db.fixed(function () {
	var Box, proto;
	Box = function (document) { this.dom = document.createTextNode(''); };
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
	return new this.DOMBox(document);
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

Relation.prototype.set('toDOMBox', function (document) {
	var box, dom;
	box = this.ns.toDOMBox(document);
	box.set(this.value);
	dom = box.dom;
	if (dom.setAttribute) dom.setAttribute('data-dbjsid', this._id_);
	this.on('update', box.set.bind(box));
	return box;
});
Relation.prototype.set('toDOM', toDOM);
