'use strict';

var copy        = require('es5-ext/lib/Object/copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , makeElement = require('dom-ext/lib/Document/prototype/make-element')
  , include     = require('dom-ext/lib/Element/prototype/include')
  , exclude     = require('dom-ext/lib/Element/prototype/exclude')
  , Input       = require('../_component')
  , getFields   = require('./_get-fields')

  , defineProperty = Object.defineProperty
  , toDOMInput;

toDOMInput = function (document/*, options*/) {
	var data = getFields(this, { selectField: 'Enum', otherField: 'String' })
	  , options = Object(arguments[1]), inputs = {}, controlOpts
	  , el = makeElement.bind(document), selectInput, other, dom, label;

	controlOpts = copy(options);
	inputs[data.names.selectField] = selectInput =
		data.rels[data.names.selectField].toDOMInput(document, controlOpts);
	inputs[data.names.otherField] = other =
		data.rels[data.names.otherField].toDOMInput(document, options);

	selectInput.on('change', function () {
		((selectInput.value === 'other') ? include : exclude).call(label);
	});

	dom = el('div', selectInput, label = el('label',
		data.rels[data.names.otherField]._label, other));
	return new Input(this, inputs, data.rels, dom);
};

module.exports = function (rel) {
	defineProperty(rel, 'toDOMInput', d(toDOMInput));
};
