'use strict';

var customError = require('es5-ext/error/custom')
  , d           = require('d/d')
  , DOMInput    = require('./_observable')
  , getFields   = require('./_get-fields')

  , Input;

module.exports = Input = function (document, type/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	_render: d(function (options) {
		var desc = options.dbOptions
		  , data = getFields(this.observable.object, desc,
				{ enumField: desc.database.StringLine,
					otherField: desc.database.StringLine })
		  , inputOpts, enumInput, other, otherItem;

		inputOpts = this.getOptions(data.observables[data.names.enumField]);
		inputOpts.type = 'radio';
		this.addItem(enumInput =
			data.observables[data.names.enumField]
			.toDOMInput(this.document, inputOpts), 'enum');
		otherItem = enumInput.listItems.other.firstChild;
		if (!otherItem) {
			throw customError("Other item not found", 'OTHER_NOT_FOUND');
		}
		otherItem.appendChild(this.document.createTextNode(': '));

		this.addItem(other =
			data.observables[data.names.otherField].toDOMInput(this.document,
				this.getOptions(data.observables[data.names.otherField])), 'other');
		otherItem.appendChild(other.dom);

		enumInput.on('change', function () {
			other.control.disabled = (enumInput.value !== 'other');
		});

		this.dom = this.document.createElement('div');
		this.dom.appendChild(enumInput.dom);
	})
});
