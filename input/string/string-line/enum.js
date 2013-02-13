'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , getObject      = require('dbjs/lib/objects')._get
  , DOMRadio       = require('../../_controls/radio')
  , DOMSelect      = require('../../_controls/select')

  , Enum = getObject('Enum'), StringLine = getObject('StringLine')
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select;

require('../../');

Enum.set('chooseLabel', StringLine.rel({ required: true, value: 'Choose:' }));

Select = function (document, ns/*, options*/) {
	DOMSelect.apply(this, arguments);
	this.chooseOption = createOption.call(this, '',
		ns._chooseLabel.toDOM(document));
	this.dbOptions = ns.options.itemsListByOrder()
		.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.render);
	this.render();
};
Select.prototype = Object.create(DOMSelect.prototype, extend({
	constructor: d(Select),
	createOption: d(function (item) {
		return createOption.call(this, item._subject_,
			item._label.toDOM(this.document));
	})
}, d.binder({
	render: d(function () {
		replaceContent.call(this.dom, this.chooseOption, this.dbOptions);
	})
})));

Radio = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	DOMRadio.call(this, document, ns, options);
	this.dom.classList.add('enum');
	this.dbOptions = ns.options.itemsListByOrder()
		.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.render);
	this.castKnownAttributes(options);
	this.render();
};
Radio.prototype = Object.create(DOMRadio.prototype, extend({
	constructor: d(Radio),
	createOption: d(function (item) {
		return createRadio.call(this, item._subject_,
			item._label.toDOM(this.document));
	})
}, d.binder({
	render: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

module.exports = Object.defineProperties(Enum, {
	DOMRadio: d(Radio),
	DOMSelect: d(Select),
	toDOMInput: d(function (document/*, options, relation*/) {
		var options = Object(arguments[1]);
		if (options.multiple) {
			return new this.DOMMultipleInput(document, this, options);
		}
		if (options.type === 'radio') {
			return new this.DOMRadio(document, this, options);
		} else {
			return new this.DOMSelect(document, this, options);
		}
	})
});
