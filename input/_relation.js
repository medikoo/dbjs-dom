'use strict';

var Db       = require('dbjs')
  , relation = module.exports = require('dbjs/lib/_relation');

require('./base');

relation.set('toDOMInputBox', function (document/*, options*/) {
	var box, options = arguments[1];
	box = this.ns.toDOMInputBox(document, options);
	box.set(this.objectValue);
	box.setAttribute('name', this._id_);
	if (this.required && (!options || (options.type !== 'checkbox'))) {
		box.setAttribute('required', true);
	}
	this.on('change', function () { box.set(this.objectValue); });
	return box;
});

relation.set('toDOMInput', Db.Base.prototype.toDOMInput);
