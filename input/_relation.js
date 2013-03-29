'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation');

module.exports = Object.defineProperties(relation, {
	toDOMInput: d(function (document/*, options*/) {
		var input, options, ns, required;
		options = Object(arguments[1]);
		ns = this.__ns.__value;
		options.relation = this;
		required = this.__required.__value;
		if (required && (options.required == null)) options.required = true;
		if (options.multiple == null) options.multiple = this.__multiple.__value;
		if (options.name == null) options.name = this._id_;
		if (options.DOMInput) input = new options.DOMInput(document, ns, options);
		else if (this.DOMInput) input = new this.DOMInput(document, ns, options);
		else input = ns.toDOMInput(document, options);
		return this.assignDOMInput(input, options);
	}),
	assignDOMInput: d(function (input/*, options*/) {
		var required, onChange, multiple, value, options;
		options = Object(arguments[1]);
		if (options.multiple == null) options.multiple = this.__multiple.__value;
		multiple = options.multiple;
		required = this.__required.__value;
		if (input.dismiss) input.dismiss();
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
		if (this.__multiple.__value) {
			this.on('add', onChange);
			this.on('delete', onChange);
		} else {
			this.on('change', onChange);
		}
		input.dismiss = function () {
			this.off('add', onChange);
			this.off('delete', onChange);
			this.off('change', onChange);
		}.bind(this);
		return input;
	}),
	DOMId: d.gs(function () {
		return this._id_.replace(/:/g, '-').replace('#', '-');
	})
});

relation.get('fieldHint').ns = Db.String;
