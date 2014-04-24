'use strict';

var d              = require('d')
  , Input          = require('./_controls/input')
  , Checkbox       = require('./_controls/checkbox')
  , Radio          = require('./_controls/radio')
  , Select         = require('./_controls/select')
  , Textarea       = require('./_controls/textarea')
  , InputComposite = require('./_composite')
  , MultipleInput  = require('./_multiple')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

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
		})
	});
	defineProperty(db.Base.prototype, 'toDOMInput',
		d(function (document/*, options*/) {
			var box = this.constructor.toDOMInput.apply(this.constructor, arguments);
			box.value = this;
			return box;
		}));
};
