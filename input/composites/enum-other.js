'use strict';

var customError = require('es5-ext/error/custom')
  , d           = require('d')
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
		  , inputOpts, enumInput, other, otherItem, observable;

		observable = data.observables[data.names.enumField];
		inputOpts = this.getOptions(observable);
		inputOpts.type = 'radio';
		this.addItem(enumInput = observable.toDOMInput(this.document, inputOpts), observable.dbId);
		otherItem = enumInput.listItems.other.firstChild;
		if (!otherItem) throw customError("Other item not found", 'OTHER_NOT_FOUND');
		otherItem.appendChild(this.document.createTextNode(': '));

		observable = data.observables[data.names.otherField];
		this.addItem(other = observable.toDOMInput(this.document, this.getOptions(observable)),
			observable.dbId);
		otherItem.appendChild(other.dom);

		enumInput.on('change', function () { other.control.disabled = (enumInput.value !== 'other'); });

		this.dom = this.document.createElement('div');
		this.dom.className = 'inputs';
		this.dom.appendChild(enumInput.dom);
	})
});
