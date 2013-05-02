'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , copy           = require('es5-ext/lib/Object/copy')
  , filter         = require('es5-ext/lib/Object/filter')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , makeElement    = require('dom-ext/lib/Document/prototype/make-element')
  , castAttribute  = require('dom-ext/lib/Element/prototype/cast-attribute')
  , replace        = require('dom-ext/lib/Element/prototype/replace')
  , relation       = require('dbjs/lib/_relation')
  , htmlAttributes = require('./_html-attributes')

  , keys = Object.keys
  , toDOM = function () { return this.dom; }
  , componentRender;

componentRender = function (input, options) {
	var el = makeElement.bind(input.document);
	return el('label', (options.label && [options.label, ': ']) || null, input,
		// required mark
		el('span', { class: 'required-status' }, '*'),
		// validation status mark
		el('span', { class: 'validation-status' }, '✓'),
		// error message
		el('span', { class: 'error-message error-message-' +
			input._name.replace(':', '-') }),
		// hint
		options.hint && el('span', { 'class': 'hint' }, options.hint));
};

module.exports = Object.defineProperties(relation, {
	DOMInput: d(null),
	toDOMInput: d(function (document/*, options*/) {
		var input, initOptions = Object(arguments[1]), options = copy(initOptions)
		  , ns, value, onChange, onMetaChange, onRequiredChange;

		// Setup input options
		if (options.multiple == null) options.multiple = this.multiple;
		if (options.name == null) options.name = this._id_;
		options.dbOptions = this;

		// Initialize input
		ns = this.ns;
		if (options.DOMInput) input = new options.DOMInput(document, ns, options);
		else if (this.DOMInput) input = new this.DOMInput(document, ns, options);
		else input = ns.toDOMInput(document, options);
		input.relation = this;

		// Set input value
		value = this.value;
		if (this.multiple && !options.multiple) value = value.values[0] || null;
		input.value = value;

		// Attach listeners
		onChange = function (value) {
			if (this.multiple) {
				value = this.value;
				if (!options.multiple) value = value.values[0] || null;
			}
			input.value = value;
		};
		if (this.multiple) {
			this.on('add', onChange);
			this.on('delete', onChange);
		} else {
			this.on('change', onChange);
		}
		if (initOptions.required == null) {
			this._required.on('change', onRequiredChange = function (value) {
				input.castAttribute('required', value);
			});
		}

		// Destroy and replace on major meta changes
		this._ns.once('change', onMetaChange = function () {
			input.destroy();
			if (input.dom.parentNode) {
				replace.call(input.dom, this.toDOMInput(document, initOptions).dom);
			}
		}.bind(this));
		if (initOptions.multiple == null) {
			this._multiple.once('change', onMetaChange);
		}

		input.once('destroy', function () {
			delete input.relation;
			this.off('add', onChange);
			this.off('delete', onChange);
			this.off('change', onChange);
			this._required.off('change', onRequiredChange);
			this._ns.off('change', onMetaChange);
			this._multiple.off('change', onMetaChange);
		}.bind(this));
		return input;
	}),
	toDOMInputComponent: d(function (document/*, options*/) {
		var options = copy(Object(arguments[1])), input, inputOptions, dom, cb
		  , defined, updateDefinedStatus;

		inputOptions = filter(options, function (value, name) {
			return !htmlAttributes[name];
		});
		input = this.toDOMInput(document, inputOptions);

		if (options.label == null) options.label = this._label;
		if (options.hint == null) options.hint = this._inputHint;

		dom = (options.render || componentRender)(input, options);
		forEach(options, function (value, name) {
			if (htmlAttributes[name]) castAttribute.call(dom, name, value);
		}, this);

		dom.classList.add('dbjs-input-component');

		// Required
		input.on('change:required', cb = function (value) {
			dom.classList[value ? 'add' : 'remove']('dbjs-required');
		});
		cb(input.required);

		// Changed
		input.on('change:changed', cb = function (value) {
			dom.classList[value ? 'add' : 'remove']('changed');
		});
		cb(input.changed);

		// Valid
		input.on('change:valid', cb = function (value) {
			dom.classList[value ? 'add' : 'remove']('valid');
		});
		cb(input.valid);

		// DBJS Invalid
		this.on('change', cb = function () {
			var value = this.required && (this.value == null);
			dom.classList[value ? 'add' : 'remove']('dbjs-invalid');
		});
		this._required.on('change', cb);
		cb.call(this);
		input.on('destroy', function (cb) {
			this.off('change', cb);
			this._required.off('change', cb);
		}.bind(this, cb));

		// DBJS Undefined
		if (input.isComposite) {
			defined = {};
			updateDefinedStatus = function () {
				dom.classList[keys(defined).length ? 'remove' :
						'add']('dbjs-undefined');
			};
			forEach(input.items, function (input) {
				var rel = input.relation, cb;
				if (!rel) return;
				if (rel.hasOwnProperty('_value')) defined[rel.name] = true;
				rel.on('selfupdate', cb = function (nu, old) {
					if (!nu || (nu.value === undefined)) delete defined[rel.name];
					else defined[rel.name] = true;
					updateDefinedStatus();
				});
				input.on('destroy', function () { rel.off('selfupdate', cb); });
			});
			updateDefinedStatus();
		} else {
			this.on('selfupdate', cb = function (nu, old) {
				dom.classList[(!nu || (nu.value === undefined)) ? 'add' :
						'remove']('dbjs-undefined');
			});
			cb.call(this,
				this.hasOwnProperty('_value') ? { value: this._value } : null);
			input.on('destroy', function (cb) {
				this.off('selfupdate', cb);
			}.bind(this, cb));
		}
		return { dom: dom, input: input, toDOM: toDOM };
	})
});
