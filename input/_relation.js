'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation');

module.exports = Object.defineProperties(relation, {
	toDOMInput: d(function (document/*, options*/) {
		var input, options, ns, required, onChange, multiple;
		options = Object(arguments[1]);
		ns = this.__ns.__value;
		options.relation = this;
		required = this.__required.__value;
		if (required) options.required = true;
		multiple = options.multiple = this.__multiple.__value;
		if (options.name == null) options.name = this._id_;
		input = ns.toDOMInput(document, options);
		input.value = this.objectValue;
		if (required) {
			input.required = required;
			input.valid = (input.value != null);
		}
		if (options.disabled) input.castAttribute('disabled', true);
		onChange = function () { input.value = this.objectValue; };
		if (multiple) {
			this.on('add', onChange);
			this.on('delete', onChange);
		} else {
			this.on('change', onChange);
		}
		return input;
	}),
	DOMId: d.gs(function () {
		return this._id_.replace(/:/g, '-').replace('#', '-');
	})
});

relation.get('fieldHint').ns = Db.String;
