'use strict';

var Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation');

module.exports = relation;

require('./base');

relation.set('toDOMBox', function (document) {
	var ns, toBox, assign;
	ns = this.__ns.__value;
	toBox = ns.__toDOMBox.__value;
	assign = this.__assignDOMBox.__value;
	return assign.call(this, toBox.call(ns, document, ns));
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
