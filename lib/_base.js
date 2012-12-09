'use strict';

var Db = module.exports = require('dbjs')
  , Relation = require('dbjs/lib/_internals/relation');

Db.Base.set('toDOMInput');
Db.Base.prototype.set('toDOMInput');

Relation.prototype.set('toDOMInput', function (document/*, options*/) {
	var input, value = this.value, options = arguments[1];
	if (value != null) input = this.ns.prototype.toDOMInput.call(value, document);
	else input = this.ns.toDOMInput(document);
	input.setAttribute('name', this.name);
	if (this.required) input.setAttribute('required', 'required');
	if (options) {
		Object.keys(Object(options)).forEach(function (name) {
			var value = options[name];
			if (value == null) {
				input.removeAttribute(name);
				delete input[name];
			} else if (typeof value === 'function') {
				input.setAttribute(name, name);
				input[name] = value;
			} else if (typeof value === 'boolean') {
				if (value) {
					input.setAttribute(name, name);
				} else {
					input.removeAttribute(name);
					delete input[name];
				}
			} else {
				input.setAttribute(name, value);
			}
		});
	}
	return input;
});
