'use strict';

var CustomError = require('es5-ext/lib/Error/custom')
  , d           = require('es5-ext/lib/Object/descriptor')
  , DOMInput    = require('./_relation')
  , getFields   = require('./_get-fields')

  , Input;

module.exports = Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var rel = options.dbOptions
		  , data = getFields(rel, { enumField: 'Enum', otherField: 'StringLine' })
		  , inputOpts, enumInput, other, otherItem;

		inputOpts = this.getOptions(data.rels[data.names.enumField]);
		inputOpts.type = 'radio';
		this.addItem(enumInput =
			data.rels[data.names.enumField].toDOMInput(this.document, inputOpts),
			'enum');
		otherItem = enumInput.listItems.other.firstChild;
		if (!otherItem) {
			throw new CustomError("Other item not found", 'OTHER_NOT_FOUND');
		}
		otherItem.appendChild(this.document.createTextNode(': '));

		this.addItem(other =
			data.rels[data.names.otherField].toDOMInput(this.document,
				this.getOptions(data.rels[data.names.otherField])), 'other');
		otherItem.appendChild(other.dom);

		enumInput.on('change', function () {
			other.control.disabled = (enumInput.value !== 'other');
		});

		this.dom = this.document.createElement('div');
		this.dom.appendChild(enumInput.dom);
	})
});
