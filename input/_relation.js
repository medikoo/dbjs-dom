'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation');

module.exports = Object.defineProperties(relation, {
	toDOMInput: d(function (document/*, options*/) {
		var input, options, ns, required, onChange, multiple, value;
		options = Object(arguments[1]);
		ns = this.__ns.__value;
		options.relation = this;
		required = this.__required.__value;
		if (required && (options.required == null)) options.required = true;
		if (options.multiple == null) options.multiple = this.__multiple.__value;
		multiple = options.multiple;
		if (options.name == null) options.name = this._id_;
		input = ns.toDOMInput(document, options);
		value = this.objectValue;
		if (value && !multiple && this.__multiple.__value) {
			value = value.values[0] || null;
		}
		input.value = value;
		if (required) {
			input.required = required;
			input.valid = (input.value != null);
		}
		if (options.disabled) input.castAttribute('disabled', true);
		onChange = function () {
			var value = this.objectValue;
			if (value && !multiple && this.__multiple.__value) {
				value = value.values[0] || null;
			}
			input.value = value;
		};
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
