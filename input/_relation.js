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
		input = ns.toDOMInput(document, options);
		input.value = this.objectValue;
		if (options.name == null) input.castAttribute('name', this._id_);
		required = this.__required.__value;
		if (required && ((options.type !== 'checkbox') &&
				((options.required == null) || options.required))) {
			input.castAttribute('required', true);
		}
		if (required) {
			input.required = required;
			input.valid = (input.value != null);
		}
		if (options.disabled) input.castAttribute('disabled', true);
		this.on('change', function () { input.value = this.objectValue; });
		return input;
	}),
	DOMId: d.gs(function () {
		return this._id_.replace(/:/g, '-').replace('#', '-');
	})
});

relation.get('fieldHint').ns = Db.String;
