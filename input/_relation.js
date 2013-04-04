'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , copy     = require('es5-ext/lib/Object/copy')
  , replace  = require('dom-ext/lib/Element/prototype/replace')
  , Db       = require('dbjs')
  , relation = require('dbjs/lib/_relation')

  , prepareOptions;

prepareOptions = function (rel, options) {
	var required;
	options = copy(Object(options));
	options.relation = rel;
	required = rel.__required.__value;
	if (required && (options.required == null)) options.required = true;
	if (options.multiple == null) options.multiple = rel.__multiple.__value;
	if (options.name == null) options.name = rel._id_;
	return options;
};

module.exports = Object.defineProperties(relation, {
	toDOMInput: d(function (document/*, options*/) {
		var input, options, ns;
		options = prepareOptions(this, arguments[1]);
		ns = this.__ns.__value;
		if (options.DOMInput) input = new options.DOMInput(document, ns, options);
		else if (this.DOMInput) input = new this.DOMInput(document, ns, options);
		else input = ns.toDOMInput(document, options);
		return this.assignDOMInput(input, arguments[1]);
	}),
	assignDOMInput: d(function (input/*, options*/) {
		var required, onChange, onNsUpdate, multiple, value, baseOptions, options;
		baseOptions = arguments[1];
		options = prepareOptions(this, arguments[1]);
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
		this._ns.on('change', onNsUpdate = function () {
			input.dismiss();
			replace.call(input.dom, this.toDOMInput(input.document, baseOptions).dom);
		}.bind(this));
		input.dismiss = function () {
			this.off('add', onChange);
			this.off('delete', onChange);
			this.off('change', onChange);
			this._ns.off('change', onNsUpdate);
		}.bind(this);
		return input;
	}),
	DOMId: d.gs(function () {
		return this._id_.replace(/:/g, '-').replace('#', '-');
	})
});

relation.get('fieldHint').ns = Db.String;
