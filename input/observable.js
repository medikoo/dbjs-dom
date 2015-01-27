'use strict';

var copy             = require('es5-ext/object/copy')
  , assign           = require('es5-ext/object/assign')
  , filter           = require('es5-ext/object/filter')
  , forEach          = require('es5-ext/object/for-each')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , isSet            = require('es6-set/is-set')
  , d                = require('d')
  , castAttribute    = require('dom-ext/element/#/cast-attribute')
  , PropObserv       = require('dbjs/_setup/1.property/observable')
  , DescPropObserv   = require('dbjs/_setup/3.descriptor-property/observable')
  , htmlAttributes   = require('./_html-attributes')
  , componentRender  = require('./utils/get-component-render')('div')
  , resolveOptions   = require('./utils/resolve-options')

  , toDOM = function () { return this.dom; };

Object.defineProperties(PropObserv.prototype, {
	DOMInput: d(null),
	toDOMInput: d(function (document/*, options*/) {
		var input, options = normalizeOptions(arguments[1]), type, value, onChange, desc, isMap = false;

		desc = this.descriptor;
		if (desc.nested) {
			isMap = this.object.database.isObjectType(this.value.__descriptorPrototype__.type);
		}
		// Setup input options
		if (options.multiple == null) {
			if (isMap) {
				options.multiple = true;
			} else {
				options.multiple = desc.multiple;
			}
		}
		if (options.name == null) options.name = this.dbId;
		options.dbOptions = desc;
		options.observable = this;

		// Initialize input
		type = isMap ? this.value.__descriptorPrototype__.type : desc.type;
		options = resolveOptions(options, type);
		if (options.DOMInput) input = new options.DOMInput(document, type, options);
		else if (desc.DOMInput) input = new desc.DOMInput(document, type, options);
		else input = type.toDOMInput(document, options);
		input.observable = this;

		// Set input value
		value = this.value;
		if (isSet(value) && !options.multiple) value = value.values().next().value || null;
		if ((value === undefined) && (options.value != null)) value = options.value;
		input.value = value;

		// Attach listeners
		onChange = function () {
			var value = this.value;
			if (isSet(value)) {
				if (!options.multiple) value = value.values().next().value || null;
			}
			input.value = value;
		}.bind(this);
		if (isMap || isSet(value)) value.on('change', onChange);
		else this.on('change', onChange);

		input.once('destroy', function () {
			delete input.observable;
			if (isSet(value)) value.off('change', onChange);
			this.off('change', onChange);
		}.bind(this));

		type.emit('dominput', input);
		desc.emit('dominput', input);
		return input;
	}),
	toDOMInputComponent: d(function (document/*, options*/) {
		var options = copy(Object(arguments[1])), input, inputOptions, dom, cb, desc = this.descriptor;

		inputOptions = filter(options, function (value, name) {
			if (name === 'render') return false;
			return !htmlAttributes[name];
		});
		if (options.input) {
			assign(inputOptions, options.input);
			delete inputOptions.input;
		}
		input = this.toDOMInput(document, inputOptions);

		if (options.label === false) options.label = null;
		else if (options.label == null) options.label = desc.label;
		if (options.hint == null) options.hint = desc.inputHint;

		dom = (options.render || componentRender)(input, options);
		if (!dom._dbjsInput) dom._dbjsInput = input;
		forEach(options, function (value, name) {
			if (htmlAttributes[name]) castAttribute.call(dom, name, value);
		}, this);

		dom.classList.add('dbjs-input-component');

		// Required
		dom.classList[input.required ? 'add' : 'remove']('required');
		dom.classList[input.required ? 'remove' : 'add']('optional');

		// Changed
		input.on('change:changed', cb = function (value) {
			dom.classList[value ? 'add' : 'remove']('changed');
			dom.classList[value ? 'remove' : 'add']('not-changed');
		});
		cb(input.changed);

		// Valid
		input.on('change:valid', cb = function (value) {
			dom.classList[value ? 'add' : 'remove']('valid');
			dom.classList[value ? 'remove' : 'add']('invalid');
		});
		cb(input.valid);

		// DBJS valid/invalid & empty/filled
		this.on('change', cb = function () {
			var desc = this.descriptor, isInvalid, value;
			isInvalid = desc.required && (this.value == null);
			dom.classList[isInvalid ? 'add' : 'remove']('dbjs-invalid');
			dom.classList[isInvalid ? 'remove' : 'add']('dbjs-valid');
			value = this.value;
			if (isSet(value)) {
				dom.classList[value.size ? 'remove' : 'add']('dbjs-empty');
				dom.classList[value.size ? 'add' : 'remove']('dbjs-filled');
			} else {
				dom.classList[value == null ? 'add' : 'remove']('dbjs-empty');
				dom.classList[value == null ? 'remove' : 'add']('dbjs-filled');
			}
		}.bind(this));
		cb();
		if (isSet(this.value)) this.value.on('change', cb);
		input.on('destroy', function (cb) { this.off('change', cb); }.bind(this, cb));

		return { dom: dom, input: input, toDOM: toDOM };
	})
});

Object.defineProperties(DescPropObserv.prototype, {
	DOMInput: d(null),
	toDOMInput: d(function (document/*, options*/) {
		var input, initOptions = Object(arguments[1]), options = copy(initOptions)
		  , type, onChange, descDesc = this.descriptor;

		// Setup input options
		if (options.name == null) options.name = this.dbId;

		// Initialize input
		type = descDesc.type;
		if (options.DOMInput) input = new options.DOMInput(document, type, options);
		else if (this.DOMInput) input = new this.DOMInput(document, type, options);
		else input = type.toDOMInput(document, options);
		input.observable = this;

		// Set input value
		input.value = this.value;

		// Attach listeners
		onChange = function () { input.value = this.value; }.bind(this);
		this.on('change', onChange);

		input.once('destroy', function () {
			delete input.observable;
			this.off('change', onChange);
		}.bind(this));

		type.emit('dominput', input);
		descDesc.emit('dominput', input);
		return input;
	})
});
