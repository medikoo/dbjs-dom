'use strict';

var assign           = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , filter           = require('es5-ext/object/filter')
  , forEach          = require('es5-ext/object/for-each')
  , isSet            = require('es6-set/is-set')
  , d                = require('d')
  , castAttribute    = require('dom-ext/element/#/cast-attribute')
  , isNestedObject   = require('dbjs/is-dbjs-nested-object')
  , Input            = require('./_controls/input')
  , Checkbox         = require('./_controls/checkbox')
  , Radio            = require('./_controls/radio')
  , Select           = require('./_controls/select')
  , Textarea         = require('./_controls/textarea')
  , InputComposite   = require('./_composite')
  , MultipleInput    = require('./_multiple')
  , htmlAttributes   = require('./_html-attributes')
  , componentRender  = require('./utils/get-component-render')('div')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty

  , toDOM = function () { return this.dom; };

module.exports = function (db) {
	defineProperties(db.Base, {
		DOMInput: d(Input),
		DOMCheckbox: d(Checkbox),
		DOMRadio: d(Radio),
		DOMSelect: d(Select),
		DOMTextarea: d(Textarea),
		DOMMultipleInput: d(MultipleInput),
		DOMInputComposite: d(InputComposite),
		fromInputValue: d(function (value) {
			if (value == null) return undefined;
			return value.trim() || null;
		}),
		toInputValue: d(function (value) {
			if (value == null) return null;
			return String(value);
		}),
		toDOMInput: d(function (document/*, options*/) {
			var box, options = Object(arguments[1]);
			if (options.multiple) {
				return new this.DOMMultipleInput(document, this, options);
			}
			box = new this.DOMInput(document, this, options);
			return box;
		}),
		toDOMInputComponent: d(function (document/*, options*/) {
			var options = normalizeOptions(arguments[1]), input, inputOptions, dom, cb
			  , db = this.database;

			inputOptions = filter(options, function (value, name) {
				if (name === 'render') return false;
				return !htmlAttributes[name];
			});
			if (options.input) {
				assign(inputOptions, options.input);
				delete inputOptions.input;
			}
			input = this.toDOMInput(document, inputOptions);

			dom = (options.render || componentRender)(input, options);
			if (!dom._dbjsInput) dom._dbjsInput = input;
			forEach(options, function (value, name) {
				if (htmlAttributes[name]) castAttribute.call(dom, name, value);
			}, this);

			dom.classList.add('dbjs-input-component');

			// Required
			dom.classList[options.required ? 'add' : 'remove']('dbjs-required');
			dom.classList[options.required ? 'remove' : 'add']('dbjs-optional');

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

			dom.classList.add('dbjs-not-own');
			// DBJS valid/invalid & empty/filled
			this.on('change', cb = function () {
				var isInvalid, value, isEmpty;
				if (options.required) {
					if (this.value == null) {
						isInvalid = true;
					} else if (db.File && (this.value instanceof db.File) && isNestedObject(this.value)) {
						isEmpty = isInvalid = !this.value.name;
						this.value._name.once('change', cb);
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
			}.bind(this));
			cb();
			if (isSet(this.value)) this.value.on('change', cb);
			input.on('destroy', function (cb) { this.off('change', cb); }.bind(this, cb));
			return { dom: dom, input: input, toDOM: toDOM };
		})
	});
	defineProperty(db.Base.prototype, 'toDOMInput',
		d(function (document/*, options*/) {
			var box = this.constructor.toDOMInput.apply(this.constructor, arguments);
			box.value = this;
			return box;
		}));
};
