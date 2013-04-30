'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , isPlainObject  = require('es5-ext/lib/Object/is-plain-object')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , ObjectType     = require('dbjs').Object
  , getObject      = require('dbjs/lib/objects')._get
  , DOMRadio       = require('./_controls/radio')
  , DOMSelect      = require('./_controls/select')

  , StringLine = getObject('StringLine')
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
	this.castHtmlAttributes(options);
	this.render();
};
Radio.prototype = Object.create(DOMRadio.prototype, extend({
	constructor: d(Radio),
	createOption: d(function (obj) {
		return createRadio.call(this, obj._id_,
			this.property ? obj.get(this.property).toDOM(this.document) :
					this.document.createTextNode(obj));
	})
}, d.binder({
	render: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

module.exports = Object.defineProperties(ObjectType, {
	fromInputValue: d(function (value) {
		var empty;
		if (isPlainObject(value)) {
			empty = true;
			forEach(value, function (subValue, name) {
				subValue = this.get(name).ns.fromInputValue(subValue);
				value[name] = subValue;
				if (subValue != null) empty = false;
			}, this.prototype);
			return empty ? null : value;
		}
		value = value.trim();
		if (!value) return null;
		if (!this.propertyIsEnumerable(value)) return null;
		if (this[value]._id_ !== value) return null;
		return this[value];
	}),
	toInputValue: d(function (value) {
		return (value == null) ? '' : value._id_;
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
