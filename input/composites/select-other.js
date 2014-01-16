'use strict';

var d           = require('d/d')
  , include     = require('dom-ext/element/#/include')
  , exclude     = require('dom-ext/element/#/exclude')
  , DOMInput    = require('./_observable')
  , getFields   = require('./_get-fields')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var el = this.make, desc = options.dbOptions
		  , data = getFields(options.observable.object, desc,
				{ selectField: desc.database.StringLine,
					otherField: desc.database.String })
		  , selectInput, other, label;

		this.addItem(selectInput =
			data.observables[data.names.selectField].toDOMInput(this.document,
				this.getOptions(data.observables[data.names.selectField])), 'select');
		this.addItem(other =
			data.observables[data.names.otherField].toDOMInput(this.document,
				this.getOptions(data.observables[data.names.otherField])), 'other');

		selectInput.on('change', function () {
			((selectInput.value === 'other') ? include : exclude).call(label);
		});

		this.dom = el('div', selectInput, label = el('label',
			data.observables[data.names.otherField].label, other));
	})
});
