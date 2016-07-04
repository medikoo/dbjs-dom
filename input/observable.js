'use strict';

var copy             = require('es5-ext/object/copy')
  , assign           = require('es5-ext/object/assign')
  , isEmpty          = require('es5-ext/object/is-empty')
  , filter           = require('es5-ext/object/filter')
  , forEach          = require('es5-ext/object/for-each')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , isSet            = require('es6-set/is-set')
  , d                = require('d')
  , castAttribute    = require('dom-ext/element/#/cast-attribute')
  , isNestedObject   = require('dbjs/is-dbjs-nested-object')
  , PropObserv       = require('dbjs/_setup/1.property/observable')
  , DescPropObserv   = require('dbjs/_setup/3.descriptor-property/observable')
  , htmlAttributes   = require('./_html-attributes')
  , componentRender  = require('./utils/get-component-render')('div')
  , resolveOptions   = require('./utils/resolve-options')

  , toDOM = function () { return this.dom; };

var hasOwn = function (obj, desc, sKey) {
	if (desc.multiple) {
		if (typeof desc._value_ === 'function') return false;
		return obj._hasOwnMultiple_(sKey);
	}
	return obj._hasOwn_(sKey);
};

Object.defineProperties(PropObserv.prototype, {
	DOMInput: d(null),
	toDOMInput: d(function (document/*, options*/) {
		var input, options = normalizeOptions(arguments[1]), type, value, onChange, desc, isMap = false
		  , db;

		desc = this.descriptor;
		db = desc.database;
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
		if (!input.observable) input.observable = this;

		// Set input value
		value = this.value;
		if (isSet(value) && !options.multiple) value = value.values().next().value || null;
		if ((value === undefined) && (options.value != null)) value = options.value;
		input.value = value;

		// Attach listeners
		onChange = function () {
			var nuValue = this.value;
			if (isSet(nuValue)) {
				if (!options.multiple) nuValue = nuValue.values().next().value || null;
			}
			if ((isMap || isSet(nuValue)) && (nuValue !== value)) {
				if (value && (typeof value.off === 'function')) value.off('change', onChange);
				value = nuValue;
				if (nuValue && (typeof nuValue.on === 'function')) nuValue.on('change', onChange);
			}
			input.value = nuValue;
		}.bind(this);
		this.on('change', onChange);
		if (isMap || isSet(value)) value.on('change', onChange);
		if (isNestedObject(value)) {
			if (db.NestedMap && this.value.key === 'map' && (this.value.owner instanceof db.NestedMap)) {
				this.value.owner.ordered._size.on('change', onChange);
			} else if (typeof value.getDescriptor('resolvedValue')._value_ === 'function') {
				value._resolvedValue.on('change', onChange);
			}
		}

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
		var options, input, inputOptions, dom, cb
		  , desc = this.ownDescriptor, db = desc.database, isRequired;

		options = normalizeOptions(arguments[1], desc.type.fieldOptions, desc.fieldOptions);
		inputOptions = filter(options, function (value, name) {
			if (name === 'render') return false;
			return !htmlAttributes[name];
		});
		if (options.modelRequired != null) {
			isRequired = inputOptions.required = options.modelRequired;
		} else {
			isRequired = desc.required;
		}
		if (options.input) {
			assign(inputOptions, options.input);
			delete inputOptions.input;
		}
		input = this.toDOMInput(document, inputOptions);

		if (options.label == null) {
			options.label = desc.dynamicLabelKey ? desc.object.getObservable(desc.dynamicLabelKey)
				: desc.label;
		} else if (options.label === false) {
			options.label = null;
		}

		if (options.hint == null) options.hint = desc.inputHint;
		if (options.optionalInfo == null) options.optionalInfo = desc.inputOptionalInfo;

		dom = (options.render || componentRender)(input, options);
		if (!dom._dbjsInput) dom._dbjsInput = input;
		forEach(options, function (value, name) {
			if (htmlAttributes[name]) castAttribute.call(dom, name, value);
		}, this);

		dom.classList.add('dbjs-input-component');

		// Required
		dom.classList[isRequired ? 'add' : 'remove']('dbjs-required');
		dom.classList[isRequired ? 'remove' : 'add']('dbjs-optional');

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
			var isInvalid, value, isEmpty, isOwn;
			if (isRequired) {
				if (this.value == null) {
					isInvalid = true;
				} else if (db.NestedMap && isNestedObject(this.value) && (this.value.key === 'map') &&
						(this.value.owner instanceof db.NestedMap)) {
					isEmpty = isInvalid = !this.value.owner.ordered.size;
					this.value.owner.ordered._size.once('change', cb);
				} else if (db.File && (this.value instanceof db.File) && isNestedObject(this.value)) {
					isEmpty = isInvalid = !this.value.name;
					this.value._name.once('change', cb);
				} else if (isNestedObject(this.value) &&
						(typeof this.value.getDescriptor('resolvedValue')._value_ === 'function')) {
					isEmpty = isInvalid = (this.value.resolvedValue == null);
					this.value._resolvedValue.once('change', cb);
				} else {
					isInvalid = false;
				}
			} else {
				isInvalid = false;
			}
			dom.classList[isInvalid ? 'add' : 'remove']('dbjs-invalid');
			dom.classList[isInvalid ? 'remove' : 'add']('dbjs-valid');
			value = this.value;
			if (isEmpty == null) {
				if (isSet(value)) isEmpty = !value.size;
				else isEmpty = value == null;
			}
			dom.classList[isEmpty ? 'add' : 'remove']('dbjs-empty');
			dom.classList[isEmpty ? 'remove' : 'add']('dbjs-filled');
			if (input.isComposite) return;
			isOwn = hasOwn(this.object, this.descriptor, this.__sKey__);
			dom.classList[isOwn ? 'add' : 'remove']('dbjs-own');
			dom.classList[isOwn ? 'remove' : 'add']('dbjs-not-own');
		}.bind(this));
		desc.on('selfupdate', cb);
		cb();
		if (input.isComposite) {
			(function () {
				var defined = {};
				var update = function () {
					var isOwn = !isEmpty(defined);
					dom.classList[isOwn ? 'add' : 'remove']('dbjs-own');
					dom.classList[isOwn ? 'remove' : 'add']('dbjs-not-own');
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
						update();
					});
					observable.ownDescriptor.on('selfupdate', cb);
					input.on('destroy', function () {
						observable.off('change', cb);
						observable.ownDescriptor.off('selfupdate', cb);
					});
				});
				update();
			}());
		}
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
