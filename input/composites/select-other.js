'use strict';

var d           = require('es5-ext/object/descriptor')
  , include     = require('dom-ext/lib/Element/prototype/include')
  , exclude     = require('dom-ext/lib/Element/prototype/exclude')
  , DOMInput    = require('./_relation')
  , getFields   = require('./_get-fields')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var el = this.make, rel = options.dbOptions
		  , data = getFields(rel, { selectField: 'Enum', otherField: 'String' })
		  , selectInput, other, label;

		this.addItem(selectInput =
			data.rels[data.names.selectField].toDOMInput(this.document,
				this.getOptions(data.rels[data.names.selectField])), 'select');
		this.addItem(other =
			data.rels[data.names.otherField].toDOMInput(this.document,
				this.getOptions(data.rels[data.names.otherField])), 'other');

		selectInput.on('change', function () {
			((selectInput.value === 'other') ? include : exclude).call(label);
		});

		this.dom = el('div', selectInput, label = el('label',
			data.rels[data.names.otherField]._label, other));
	})
});
