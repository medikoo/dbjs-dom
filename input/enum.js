'use strict';

var assign            = require('es5-ext/object/assign')
  , callable          = require('es5-ext/object/valid-callable')
  , validValue        = require('es5-ext/object/valid-value')
  , d                 = require('d')
  , autoBind          = require('d/auto-bind')
  , toArray           = require('es5-ext/array/to-array')
  , memoize           = require('memoizee/plain')
  , memoizeMethods    = require('memoizee/methods-plain')
  , getNormalizer     = require('memoizee/normalizers/get-1')
  , clear             = require('dom-ext/element/#/clear')
  , replaceContent    = require('dom-ext/element/#/replace-content')
  , resolveOptions    = require('./utils/resolve-options')
  , DOMRadio          = require('./_controls/radio')
  , DOMSelect         = require('./_controls/select')
  , DOMMultiple       = require('./_multiple')
  , DOMMultipleChBox  = require('./_multiple/checkbox')
  , DOMMultipleSelect = require('./_multiple/select')
  , setup             = require('./')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , generateSelect, Radio, Select, Multiple, MultipleSelect;

generateSelect = function (DOMSelect) {
	var Select = function (document, type/*, options*/) {
		var options = arguments[2];
		this.type = type;
		options = resolveOptions(options, type);
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
		this.append = options.append;
		this.reload();
	};
	Select.prototype = Object.create(DOMSelect.prototype, assign({
		constructor: d(Select)
	}, memoizeMethods({
		createOption: d(function (name) {
			var item = this.type.meta[name];
			return createOption.call(this, name,
				this.customLabels[name] || (item && item.label) || name);
		}),
		createOptgroup: d(function (name) {
			var el = this.document.createElement('optgroup');
			el.setAttribute('label', this.group.set[name].label);
			return el;
		})
	}), autoBind({
		reload: d(function () {
			var options = this.dbOptions, els, done;
			if (this.onlyFilter) {
				options = options.filter(this.onlyFilter.has, this.onlyFilter);
			}
			if (this.group) {
				els = [];
				done = {};
				options.forEach(function (name) {
					var meta = this.type.meta[name], group, optgroup, option;
					if (!meta) {
						console.warn("No meta found for", name);
						return;
					}
					group = meta[this.group.name];
					if (!group) {
						console.warn("No group found for", name);
						return;
					}
					optgroup = this.createOptgroup(group);
					option = this.createOption(name);
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
			replaceContent.call(this.dom, this.chooseOption, els, this.append);
		})
	})));
	return Select;
};
Select = generateSelect(DOMSelect);

Radio = function (document, type/*, options*/) {
	var options = arguments[2];
	this.type = type;
	options = resolveOptions(options, type);
	this.controlOptions = Object(options.controls);
	DOMRadio.call(this, document, type, options);
	this.dom.classList.add('enum');
	this.customLabels = Object(options.labels);
	this.dbOptions = toArray(type.members);
	if (options.only) {
		this.onlyFilter = options.only;
		if (this.onlyFilter.on) this.onlyFilter.on('change', this.reload);
	}
	this.reload();
};
Radio.prototype = Object.create(DOMRadio.prototype, assign({
	constructor: d(Radio),
	createOption: d(function (name) {
		var item = this.type.meta[name];
		return createRadio.call(this, name,
			this.customLabels[name] || (item && item.label) || name, this.controlOptions[name]);
	})
}, autoBind({
	reload: d(function () {
		var options = this.dbOptions;
		if (this.onlyFilter) options = options.filter(this.onlyFilter.has, this.onlyFilter);
		replaceContent.call(this.dom, options.map(this.createOption, this));
	})
})));

Multiple = function (document, type/*, options*/) {
	var meta = type.meta, options = Object(arguments[2]), filter;
	this.dbList = [];
	if (options.filter != null) filter = callable(options.filter);
	type.members.forEach(function (name) {
		var item;
		if (filter && !filter(name)) return;
		item  = meta[name];
		this.push({ label: (item && item.label) || name, value: name });
	}, this.dbList);
	DOMMultipleChBox.call(this, document, type, options);
};

Multiple.prototype = Object.create(DOMMultipleChBox.prototype, {
	constructor: d(Multiple)
});

MultipleSelect = generateSelect(DOMMultipleSelect);
module.exports = exports = memoize(function (Type) {
	setup(Type.database);
	defineProperties(Type, {
		DOMRadio: d(Radio),
		DOMSelect: d(Select),
		DOMMultipleInput: d(Multiple),
		toDOMInput: d(function (document/*, options*/) {
			var options = resolveOptions(arguments[1], this);
			if (options.multiple) {
				if (options.multiType === 'base') return new DOMMultiple(document, this, options);
				if (options.multiType === 'select') return new MultipleSelect(document, this, options);
				return new this.DOMMultipleInput(document, this, options);
			}
			if (options.type === 'radio') {
				return new this.DOMRadio(document, this, options);
			}
			return new this.DOMSelect(document, this, options);
		})
	});
	if (Type.chooseLabel == null) {
		defineProperty(Type, 'chooseLabel', d("Choose:"));
		defineProperty(Type.$getOwn('chooseLabel'), 'required', d(true));
	}
	return Type;
}, { normalizer: getNormalizer() });

exports.Select = Select;
exports.Radio = Radio;
exports.Multiple = Multiple;
