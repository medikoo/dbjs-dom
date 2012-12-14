'use strict';

var Db       = require('dbjs')
  , Relation = require('dbjs/lib/_internals/relation')

  , toDOM;

module.exports = Db;

Db.Base.set('DOMBox', Db.fixed(function () {
	var DOMBox = function (dom) { this.dom = dom; }, proto = DOMBox.prototype;
	proto.toDOM = function () { return this.dom; };
	proto.get = function () { return this.dom.data; };
	proto.set = function (value) { this.dom.data = value; };
	return DOMBox;
}));

Db.Base.set('toDOMBox', function (document) {
	return new this.DOMBox(document.createTextNode(''));
});
Db.Base.set('toDOM', function (document) {
	return this.toDOMBox(document).dom;
});
Db.Base.prototype.set('toDOMBox', function (document) {
	var box = this.ns.toDOMBox(document);
	box.set(String(this));
	return box;
});
Db.Base.prototype.set('toDOM', toDOM = function (document) {
	return this.toDOMBox(document).dom;
});

Relation.prototype.set('toDOMBox', function (document) {
	var box, dom, value = this.value;
	if (value != null) {
		if (typeof value !== 'object') {
			value = Object(value);
			value.__proto__ = this.ns.prototype;
		}
		box = this.ns.prototype.toDOMBox.call(value, document);
	} else {
		box = this.ns.toDOMBox(document);
	}
	dom = box.dom;
	if (dom.setAttribute) dom.setAttribute('data-dbjsid', this._id_);
	this.on('update', box.set.bind(box));
	return box;
});
Relation.prototype.set('toDOM', toDOM);
