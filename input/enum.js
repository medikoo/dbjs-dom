'use strict';

var assign           = require('es5-ext/object/assign-multiple')
  , validValue       = require('es5-ext/object/valid-value')
  , d                = require('d/d')
  , autoBind         = require('d/auto-bind')
  , toArray          = require('es6-iterator/to-array')
  , memoize          = require('memoizee/lib/regular')
  , memPrimitive     = require('memoizee/lib/primitive')
  , clear            = require('dom-ext/element/#/clear')
  , replaceContent   = require('dom-ext/element/#/replace-content')
  , DOMRadio         = require('./_controls/radio')
  , DOMSelect        = require('./_controls/select')
  , DOMMultiple      = require('./_multiple')
  , DOMMultipleChBox = require('./_multiple/checkbox')
  , setup            = require('./')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select, Multiple;

Select = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	DOMSelect.call(this, document, type, options);
	this.customLabels = Object(options.labels);
	if (options.group) {
		this.group = options.group;
		validValue(this.group.name);
	}
	this.dbOptions = toArray(type.members);
	if (options.only) {
		this.onlyFilter = options.only;
		if (this.onlyFilter.on) this.onlyFilter.on('change', this.reload);
	}
	this.reload();
};
Select.prototype = Object.create(DOMSelect.prototype, assign({
	constructor: d(Select)
}, memPrimitive(function (name) {
	var item = this.type.meta[name];
	return createOption.call(this, name,
		this.customLabels[name] || item.label || name);
}, { method: 'createOption' }), memPrimitive(function (name) {
	var el = this.document.createElement('optgroup');
	el.setAttribute('label', this.group.set[name].label);
	return el;
}, { method: 'createOptgroup' }), autoBind({
	reload: d(function () {
		var options = this.dbOptions, els, done;
		if (this.onlyFilter) {
			options = options.filter(this.onlyFilter.has, this.onlyFilter);
		}
		if (this.group) {
			els = [];
			done = {};
			options.forEach(function (name) {
				var item = this.type.meta[name]
				  , group = item[this.group.name]
				  , optgroup = this.createOptgroup(group)
				  , option = this.createOption(name);
				if (!done.hasOwnProperty(group)) {
					clear.call(optgroup);
					done[group] = true;
					els.push(optgroup);
				}
				optgroup.appendChild(option);
			}, this);
		} else {
			els = options.map(this.createOption);
		}
		replaceContent.call(this.dom, this.chooseOption, els);
	})
})));

Radio = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	DOMRadio.call(this, document, type, options);
	this.dom.classList.add('enum');
	this.customLabels = Object(options.labels);
	this.dbOptions = toArray(type.members).map(this.createOption, this);
	this.reload();
};
Radio.prototype = Object.create(DOMRadio.prototype, assign({
	constructor: d(Radio),
	createOption: d(function (name) {
		var item = this.type.meta[name];
		return createRadio.call(this, name,
			this.customLabels[name] || item.label || name);
	})
}, autoBind({
	reload: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

Multiple = function (document, type/*, options*/) {
	this.dbList = [];
	type.options.forEach(function (item, name) {
		this.push({ label: item.label, value: name });
	}, this.dbList);
	DOMMultipleChBox.apply(this, arguments);
};

Multiple.prototype = Object.create(DOMMultipleChBox.prototype, {
	constructor: d(Multiple)
});

module.exports = exports = memoize(function (Type) {
	setup(Type.database);
	defineProperties(Type, {
		DOMRadio: d(Radio),
		DOMSelect: d(Select),
		DOMMultipleInput: d(Multiple),
		toDOMInput: d(function (document/*, options*/) {
			var options = Object(arguments[1]);
			if (options.multiple) {
				if (options.multiType === 'base') {
					return new DOMMultiple(document, this, options);
				}
				return new this.DOMMultipleInput(document, this, options);
			}
			if (options.type === 'radio') {
				return new this.DOMRadio(document, this, options);
			}
			return new this.DOMSelect(document, this, options);
		})
	});
	if (!('chooseLabel' in Type)) {
		defineProperty(Type, 'chooseLabel', d("Choose:"));
	}
	defineProperty(Type.$getOwn('chooseLabel'), 'required', d(true));
});

exports.Select = Select;
exports.Radio = Radio;
exports.Multiple = Multiple;
