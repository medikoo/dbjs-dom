'use strict';

var copy              = require('es5-ext/object/copy')
  , assign            = require('es5-ext/object/assign')
  , filter            = require('es5-ext/object/filter')
  , forEach           = require('es5-ext/object/for-each')
  , isSet             = require('es6-set/is-set')
  , d                 = require('d/d')
  , makeElement       = require('dom-ext/document/#/make-element')
  , castAttribute     = require('dom-ext/element/#/cast-attribute')
  , PropObserv        = require('dbjs/_setup/1.property/observable')
  , DescPropObserv    = require('dbjs/_setup/3.descriptor-property/observable')
  , htmlAttributes    = require('./_html-attributes')

  , keys = Object.keys, toDOM = function () { return this.dom; }
  , componentRender, hasOwn;

componentRender = function (input, options) {
	var el = makeElement.bind(input.document);
	return el('label', (options.label && [options.label, ': ']) || null, input,
		// required mark
		el('span', { class: 'required-status' }, '*'),
		// validation status mark
		el('span', { class: 'validation-status' }, '✓'),
		// error message
		el('span', { class: 'error-message error-message-' +
			input._name.replace(/[:#\/]/g, '-') }),
		// hint
		options.hint && el('span', { 'class': 'hint' }, options.hint));
};

hasOwn = function (obj, desc, sKey) {
	if (!desc.multiple) return obj._hasOwn_(sKey);
	if (desc._resolveValueGetter_()) return (desc.object === obj);
	return obj._hasOwnMultiple_(sKey);
};

Object.defineProperties(PropObserv.prototype, {
	DOMInput: d(null),
	toDOMInput: d(function (document/*, options*/) {
		var input, initOptions = Object(arguments[1]), options = copy(initOptions)
		  , type, value, onChange, desc;

		desc = this.descriptor;

		// Setup input options
		if (options.multiple == null) options.multiple = desc.multiple;
		if (options.name == null) options.name = this.dbId;
		options.dbOptions = desc;
		options.observable = this;

		// Initialize input
		type = desc.type;
		if (options.DOMInput) input = new options.DOMInput(document, type, options);
		else if (desc.DOMInput) input = new desc.DOMInput(document, type, options);
		else input = type.toDOMInput(document, options);
		input.observable = this;

		// Set input value
		value = this.value;
		if (isSet(value) && !options.multiple) {
			value = value.values().next().value || null;
		}
		input.value = value;

		// Attach listeners
		onChange = function () {
			var value = this.value;
			if (isSet(value)) {
				if (!options.multiple) value = value.values().next().value || null;
			}
			input.value = value;
		}.bind(this);
		if (isSet(value)) value.on('change', onChange);
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
		var options = copy(Object(arguments[1])), input, inputOptions, dom, cb
		  , defined, updateDefinedStatus, object, sKey, desc = this.descriptor;

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
		forEach(options, function (value, name) {
			if (htmlAttributes[name]) castAttribute.call(dom, name, value);
		}, this);

		dom.classList.add('dbjs-input-component');

		// Required
		dom.classList[input.required ? 'add' : 'remove']('dbjs-required');

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
			var desc = this.descriptor, value;
			value = desc.required && (this.value == null);
			dom.classList[value ? 'add' : 'remove']('dbjs-invalid');
		});
		cb.call(this);
		input.on('destroy', function (cb) {
			this.off('change', cb);
		}.bind(this, cb));

		// DBJS Undefined
		if (input.isComposite) {
			defined = {};
			updateDefinedStatus = function () {
				dom.classList[keys(defined).length ? 'remove' :
						'add']('dbjs-undefined');
			};
			forEach(input.items, function (input) {
				var observable = input.observable, cb, object, sKey, desc;
				if (!observable) return;
				object = observable.object;
				desc = observable.descriptor;
				sKey = observable.__sKey__;
				if (hasOwn(object, desc, sKey)) defined[sKey] = true;
				observable.on('change', cb = function (event) {
					if (hasOwn(object, desc, sKey)) defined[sKey] = true;
					else delete defined[sKey];
					updateDefinedStatus();
				});
				input.on('destroy', function () { observable.off('change', cb); });
			});
			updateDefinedStatus();
		} else {
			object = this.object;
			sKey = this.__sKey__;
			this.on('change', cb = function () {
				dom.classList[hasOwn(object, desc, sKey) ? 'remove' :
						'add']('dbjs-undefined');
			});
			this.ownDescriptor._history_.on('change', cb);
			cb();
			input.on('destroy', function (cb) {
				this.off('selfupdate', cb);
			}.bind(this, cb));
		}
		return { dom: dom, input: input, toDOM: toDOM };
	})
});

module.exports = Object.defineProperties(DescPropObserv.prototype, {
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
