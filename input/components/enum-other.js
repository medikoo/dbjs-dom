'use strict';

var CustomError = require('es5-ext/lib/Error/custom')
  , copy        = require('es5-ext/lib/Object/copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , Input       = require('../_component')
  , getFields   = require('./_get-fields')

  , defineProperty = Object.defineProperty
  , toDOMInput;

toDOMInput = function (document/*, options*/) {
	var data = getFields(this, { enumField: 'Enum', otherField: 'StringLine' })
	  , options = Object(arguments[1]), inputs = {}, controlOpts
	  , enumInput, other, otherItem, dom;

	controlOpts = copy(options);
	controlOpts.type = 'radio';
	inputs[data.names.enumField] = enumInput =
		data.rels[data.names.enumField].toDOMInput(document, controlOpts);
	otherItem = enumInput.listItems.other.firstChild;
	if (!otherItem) {
		throw new CustomError("Other item not found", 'OTHER_NOT_FOUND');
	}
	otherItem.appendChild(document.createTextNode(': '));
	inputs[data.names.otherField] = other =
		data.rels[data.names.otherField].toDOMInput(document, options);
	otherItem.appendChild(other.dom);

	enumInput.on('change', function () {
		other.control.disabled = (enumInput.value !== 'other');
	});

	dom = document.createElement('div');
	dom.appendChild(enumInput.dom);
	return new Input(this, inputs, data.rels, dom);
};

module.exports = function (rel) {
	defineProperty(rel, 'toDOMInput', d(toDOMInput));
};
