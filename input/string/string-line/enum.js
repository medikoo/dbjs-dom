'use strict';

var compact        = require('es5-ext/lib/Array/prototype/compact')
  , CustomError    = require('es5-ext/lib/Error/custom')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , safeTraverse   = require('es5-ext/lib/Object/safe-traverse')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , getObject      = require('dbjs/lib/objects')._get
  , DOMCheckbox    = require('../../_controls/checkbox')
  , DOMRadio       = require('../../_controls/radio')
  , DOMSelect      = require('../../_controls/select')
  , DOMMultiple    = require('../../_multiple')

  , Enum = getObject('Enum'), StringLine = getObject('StringLine')
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select, MultipleInput, notSupported;

require('../../');

Enum.set('chooseLabel', StringLine.rel({ required: true, value: 'Choose:' }));

Select = function (document, ns/*, options*/) {
	var chooseLabel, options = Object(arguments[2]);
	DOMSelect.apply(this, arguments);
	if (options.chooseLabel) {
		chooseLabel = document.createTextNode(options.chooseLabel);
	} else if (options.relation && options.relation.__chooseLabel.__value) {
		chooseLabel = options.relation._chooseLabel.toDOM(document);
	} else {
		chooseLabel = ns._chooseLabel.toDOM(document);
	}
	this.chooseOption = createOption.call(this, '', chooseLabel);
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
	var options = this.options = Object(arguments[2]);
	DOMRadio.call(this, document, ns, options);
	this.dom.classList.add('enum');
	this.dbOptions = ns.options.itemsListByOrder()
		.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.render);
	this.castHtmlAttributes(options);
	this.render();
};
Radio.prototype = Object.create(DOMRadio.prototype, extend({
	constructor: d(Radio),
	createOption: d(function (item) {
		return createRadio.call(this, item._subject_,
			safeTraverse(this.options, 'controls', item._subject_, 'label') ||
			item._label.toDOM(this.document));
	})
}, d.binder({
	render: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

MultipleInput = function (document, ns/*, options*/) {
	DOMMultiple.apply(this, arguments);
	delete this.options.required;
	this.itemsByValue = {};
	this.dbOptions = ns.options.itemsListByOrder()
		.liveMap(this.renderOption, this);
	this.dbOptions.on('change', this.reload);
	this.castHtmlAttributes(this.options);
	this.reload();
};

MultipleInput.prototype = Object.create(DOMMultiple.prototype, {
	constructor: d(MultipleInput),
	renderOption: d(function (item) {
		var el = this.make, label, input, value = item._subject_;
		this.itemsByValue[value] = input = new DOMCheckbox(this.document, this.ns);
		this.items.push(input);
		if (this._name) input.name = this._name;
		input.dom.setAttribute('value', value);
		input.parent = this;
		label = el('label', input, ' ', item._label);
		input.on('change', this.onchange.bind(this));
		return el('li', label);
	}),
	value: d.gs(function () {
		return compact.call(this.items.map(function (item) { return item.value; }));
	}, function (value) {
		forEach(this.itemsByValue, function (input, val) {
			input.value = value.has(val);
		});
		this._value = value.values;
		if (this.changed) this.emit('change:changed', this.changed = false);
	}),
	reload: d(function () {
		replaceContent.call(this.dom, this.dbOptions);
	}),
	render: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.className = 'dbjs multiple enum';
	}),
	renderItem: d(notSupported = function () {
		throw new CustomError("Not supported", 'NOT_SUPPORTED');
	}),
	removeItem: d(notSupported),
	addEmpty: d(notSupported)
});

module.exports = Object.defineProperties(Enum, {
	DOMRadio: d(Radio),
	DOMSelect: d(Select),
	DOMMultipleInput: d(MultipleInput),
	toDOMInput: d(function (document/*, options*/) {
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
