'use strict';

var d                = require('es5-ext/object/descriptor')
  , extend           = require('es5-ext/object/extend')
  , validValue       = require('es5-ext/object/valid-value')
  , memoize          = require('memoizee/lib/primitive')
  , clear            = require('dom-ext/lib/Element/prototype/clear')
  , replaceContent   = require('dom-ext/lib/Element/prototype/replace-content')
  , getObject        = require('dbjs/lib/objects')._get
  , DOMRadio         = require('../../_controls/radio')
  , DOMSelect        = require('../../_controls/select')
  , DOMMultiple      = require('../../_multiple')
  , DOMMultipleChBox = require('../../_multiple/checkbox')

  , Enum = getObject('Enum'), StringLine = getObject('StringLine')
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select, Multiple;

require('../../');

Enum.set('chooseLabel', StringLine.rel({ required: true, value: 'Choose:' }));

Select = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	DOMSelect.call(this, document, ns, options);
	this.customLabels = Object(options.labels);
	if (options.group) {
		this.group = options.group;
		validValue(this.group.name);
		if (!this.group.set || (this.group.set._type_ !== 'relation')) {
			throw new TypeError("Group set must be relation set");
		}
	}
	this.dbOptions = ns.options;
	this.dbOptions.listByOrder().on('change', this.reload);
	if (options.only) {
		this.onlyFilter = options.only;
		if (this.onlyFilter.on) {
			this.onlyFilter.on('add', this.reload);
			this.onlyFilter.on('delete', this.reload);
		}
	}
	this.reload();
};
Select.prototype = Object.create(DOMSelect.prototype, extend({
	constructor: d(Select)
}, memoize(function (name) {
	var item = this.dbOptions.getItem(name);
	return createOption.call(this, name,
		this.customLabels[name] || (item.label && item._label) || name);
}, { method: 'createOption' }), memoize(function (name) {
	var el = this.document.createElement('optgroup');
	el.setAttribute('label', this.group.set.getItem(name).label);
	return el;
}, { method: 'createOptgroup' }), d.binder({
	reload: d(function () {
		var options = this.dbOptions.listByOrder(), els, done;
		if (this.onlyFilter) {
			options = options.filter(this.onlyFilter.has, this.onlyFilter);
		}
		if (this.group) {
			els = [];
			done = {};
			options.forEach(function (name) {
				var item = this.dbOptions.getItem(name)
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

Radio = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	DOMRadio.call(this, document, ns, options);
	this.dom.classList.add('enum');
	this.customLabels = Object(options.labels);
	this.dbOptions = ns.options.itemsListByOrder()
		.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.reload);
	this.reload();
};
Radio.prototype = Object.create(DOMRadio.prototype, extend({
	constructor: d(Radio),
	createOption: d(function (item) {
		return createRadio.call(this, item._subject_,
			this.customLabels[item._subject_] || (item.label && item._label) ||
			item._subject_);
	})
}, d.binder({
	reload: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

Multiple = function (document, ns/*, options*/) {
	this.dbList = ns.options.itemsListByOrder().liveMap(function (item) {
		return { label: item._label, value: item._subject_ };
	}, this);
	DOMMultipleChBox.apply(this, arguments);
	this.dbList.on('change', this.reload);
};

Multiple.prototype = Object.create(DOMMultipleChBox.prototype, {
	constructor: d(Multiple)
});

module.exports = Object.defineProperties(Enum, {
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
