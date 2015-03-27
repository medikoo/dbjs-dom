'use strict';

var d              = require('d')
  , getId          = require('dom-ext/html-element/#/get-id')
  , generateScript = require('dom-ext/html-document/#/generate-inline-script')
  , DOMInput       = require('./_observable')
  , getFields      = require('./_get-fields')

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
		  , selectInput, other, label, observable;

		observable = data.observables[data.names.selectField];
		this.addItem(selectInput =
			data.observables[data.names.selectField].toDOMInput(this.document,
				this.getOptions(observable)), observable.dbId);
		observable = data.observables[data.names.otherField];
		this.addItem(other =
			data.observables[data.names.otherField].toDOMInput(this.document,
				this.getOptions(data.observables[data.names.otherField])), observable.dbId);

		label = el('label', data.observables[data.names.otherField].label, other);
		this.dom = el('div', { class: 'inputs' }, selectInput, label,
			generateScript.call(this.document, function (selectId, otherId) {
				$.selectMatch(selectId, { other: otherId });
			}, getId.call(selectInput.dom), getId.call(label)));
	})
});
