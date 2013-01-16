'use strict';

var Db       = require('dbjs')
  , relation = module.exports = require('dbjs/lib/_relation');

require('./base');

relation.set('toDOMBox', function (document) {
	return this.assignDOMBox(this.ns.toDOMBox(document, this.ns));
});
relation.set('assignDOMBox', function (box) {
	var dom, listener;
	box.dismiss();
	box.set(this.objectValue);
	dom = box.dom;
	if (dom.setAttribute) dom.setAttribute('data-dbjsid', this._id_);
	this.on('change', function () { box.set(this.objectValue); });
	box.dismiss = this.off.bind(this, 'change', listener);
	return box;
});
relation.set('toDOM', Db.Base.prototype.toDOM);
