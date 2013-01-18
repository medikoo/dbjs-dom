'use strict';

var Db       = require('dbjs')
  , relation = module.exports = require('dbjs/lib/_relation');

require('./base');

relation.set('toDOMInputBox', function (document/*, options*/) {
	var box, options = Object(arguments[1]);
	box = this.ns.toDOMInputBox(document, options, this);
	box.set(this.objectValue);
	box.setAttribute('name', this._id_);
	if (this.required && ((options.type !== 'checkbox') &&
			((options.required == null) || options.required))) {
		box.setAttribute('required', true);
	}
	if (options.disabled) box.setAttribute('disabled', true);
	this.on('change', function () { box.set(this.objectValue); });
	return box;
});

relation.set('toDOMInput', Db.Base.prototype.toDOMInput);
relation.get('fieldHint').ns = Db.String;
relation.set('DOMId', function () {
	return this._id_.replace(/:/g, '-').replace('#', '-');
});
