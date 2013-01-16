'use strict';

var Db       = require('dbjs')
  , relation = module.exports = require('dbjs/lib/_relation');

require('./base');

relation.set('toDOMBox', function (document) {
	var box, dom;
	box = this.ns.toDOMBox(document, this.ns);
	box.set(this.objectValue);
	dom = box.dom;
	if (dom.setAttribute) dom.setAttribute('data-dbjsid', this._id_);
	this.on('change', function () { box.set(this.objectValue); });
	return box;
});
relation.set('toDOM', Db.Base.prototype.toDOM);
