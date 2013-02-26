'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , ObjectType     = require('dbjs').Object
  , getObject      = require('dbjs/lib/objects')._get
  , DOMRadio       = require('./_controls/radio')
  , DOMSelect      = require('./_controls/select')

  , StringLine = getObject('StringLine')
  , selectGetSet = Object.getOwnPropertyDescriptor(DOMSelect.prototype, 'value')
  , selectGet = selectGetSet.get, selectSet = selectGetSet.set
  , radioGetSet = Object.getOwnPropertyDescriptor(DOMRadio.prototype, 'value')
  , radioGet = radioGetSet.get, radioSet = radioGetSet.set
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select;

ObjectType.set('chooseLabel',
	StringLine.rel({ required: true, value: 'Choose:' }));

Select = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), list, chooseLabel;
	DOMSelect.call(this, document, ns, options);
	if (options.chooseLabel) {
		chooseLabel = document.createTextNode(options.chooseLabel);
	} else if (options.relation && options.relation.__chooseLabel.__value) {
		chooseLabel = options.relation._chooseLabel.toDOM(document);
	} else {
		chooseLabel = ns._chooseLabel.toDOM(document);
	}
	this.chooseOption = createOption.call(this, '', chooseLabel);
	this.property = options.property;
	list = (options.compare ? ns.list(options.compare) : ns.listByCreatedAt());
	this.dbOptions = list.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.render);
	this.render();
};
Select.prototype = Object.create(DOMSelect.prototype, extend({
	constructor: d(Select),
	value: d.gs(function () {
		var value = selectGet.call(this);
		return value && this.ns[value];
	}, function (value) {
		value = (value == null) ? null : value._id_;
		selectSet.call(this, value);
		this._value = value;
	}),
	createOption: d(function (obj) {
		return createOption.call(this, obj._id_,
			this.property ? obj.get(this.property).toDOM(this.document) :
					this.document.createTextNode(obj));
	})
}, d.binder({
	render: d(function () {
		replaceContent.call(this.dom, this.chooseOption, this.dbOptions);
	})
})));

Radio = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), list;
	DOMRadio.call(this, document, ns, options);
	this.dom.classList.add('object-list');
	this.property = options.property;
	list = (options.compare ? ns.list(options.compare) : ns.listByCreatedAt());
	this.dbOptions = list.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.render);
	this.castKnownAttributes(options);
	this.render();
};
Radio.prototype = Object.create(DOMRadio.prototype, extend({
	constructor: d(Radio),
	value: d.gs(function () {
		var value = radioGet.call(this);
		return value && this.ns[value];
	}, function (value) {
		value = (value == null) ? null : value._id_;
		radioSet.call(this, value);
		this._value = value;
	}),
	createOption: d(function (obj) {
		return createRadio.call(this, obj._id_,
			this.property ? obj.get(this.property).toDOM(this.document) :
					this.document.createTextNode(obj));
	})
}, d.binder({
	render: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

module.exports = Object.defineProperties(ObjectType, {
	unserializeDOMInputValue: d(function (value) {
		if (value == null) return null;
		if (!this.propertyIsEnumerable(value)) return null;
		if (this[value]._id_ !== value) return null;
		return this[value];
	}),
	DOMRadio: d(Radio),
	DOMSelect: d(Select),
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
