'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , getObject   = require('dbjs/lib/objects')._get
  , DOMRadio    = require('../../_controls/radio')
  , DOMSelect   = require('../../_controls/select')

  , Enum = getObject('Enum'), StringLine = getObject('StringLine')

  , Radio, Select;

require('../../');

Enum.set('chooseLabel', StringLine.rel({ required: true, value: 'Choose:' }));

Select = function (document, ns) {
	DOMSelect.call(this, document, ns);
	this.dom.appendChild(this.createOption('',
		ns._chooseLabel.toDOM(document)));
	ns.options.forEach(function (value, item) {
		this.dom.appendChild(this.createOption(value, item._label.toDOM(document)));
	}, this);
};
Select.prototype = Object.create(DOMSelect.prototype, {
	constructor: d(Select)
});

Radio = function (document, ns) {
	DOMRadio.call(this, document, ns);
	this.dom.classList.add('enum');
	ns.options.forEach(function (value, item) {
		this.dom.appendChild(this.createOption(value, item._label.toDOM(document)));
	}, this);
};
Radio.prototype = Object.create(DOMRadio.prototype, {
	constructor: d(Radio)
});

module.exports = Object.defineProperties(Enum, {
	DOMRadio: d(Radio),
	DOMSelect: d(Select),
	toDOMInput: d(function (document/*, options, relation*/) {
		var box, options = Object(arguments[1]);
		if (options.type === 'radio') {
			box = new this.DOMRadio(document, this);
		} else {
			box = new this.DOMSelect(document, this);
		}
		box.castKnownAttributes(options);
		return box;
	})
});
