'use strict';

var noop           = require('es5-ext/lib/Function/noop')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , some           = require('es5-ext/lib/Object/some')
  , validValue     = require('es5-ext/lib/Object/valid-value')
  , memoize        = require('memoizee/lib/primitive')
  , makeElement    = require('dom-ext/lib/Document/prototype/make-element')
  , clear          = require('dom-ext/lib/Element/prototype/clear')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , nextTickOnce   = require('next-tick/lib/once')
  , getObject      = require('dbjs/lib/objects')._get
  , DOMCheckbox    = require('../../_controls/checkbox')
  , DOMRadio       = require('../../_controls/radio')
  , DOMSelect      = require('../../_controls/select')
  , DOMInput       = require('../../_controls/input')
  , DOMMultiple    = require('../../_multiple')

  , Enum = getObject('Enum'), StringLine = getObject('StringLine')
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get

  , Radio, Select, MultipleInput;

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

MultipleInput = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.items = {};
	this.make = makeElement.bind(document);
	this.onChange = nextTickOnce(this.onChange.bind(this));
	DOMInput.call(this, document, ns, options);
	this.options = Object(options.control);
	this.dbOptions = ns.options.itemsListByOrder()
		.liveMap(this.renderOption, this);
	this.dbOptions.on('change', this.reload);
	this.reload();
};

MultipleInput.prototype = Object.create(DOMInput.prototype, {
	_value: d(null),
	controlAttributes: d({}),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid;
		value = this.value;
		changed = some(this.items, function (item) { return item.changed; });
		valid = this.required ? Boolean(value.length) : true;

		if (this.changed !== changed) {
			this.changed = changed;
			emitChanged = true;
		}
		if (this.valid !== valid) {
			this.valid = valid;
			emitValid = true;
		}

		this.emit('change', value);
		if (emitChanged) this.emit('change:changed', this.changed);
		if (emitValid) this.emit('change:valid', this.valid);
	}),
	name: d.gs(getName, function (name) {
		this._name = name;
		name = this.name;
		forEach(this.items, function (input) { input.name = name; });
	}),
	value: d.gs(function () {
		return this.ns.options.listByOrder().filter(function (value) {
			return this.items[value].value;
		}, this);
	}, function (value) {
		forEach(this.items, function (input, val) {
			input.value = value.has(val) || null;
		});
		this.onChange();
	}),
	castControlAttribute: d(noop),
	_render: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.className = 'dbjs multiple enum';
	}),
	renderOption: d(function (item) {
		var el = this.make, label, input, value = item._subject_;
		this.items[value] = input =
			new DOMCheckbox(this.document, this.ns, this.options);
		input.name = this.name;
		input.setCheckedValue(value);
		input.parent = this;
		label = el('label', input, ' ', item._label);
		input.on('change', this.onChange);
		return el('li', label);
	}),
	reload: d(function () { replaceContent.call(this.dom, this.dbOptions); })
});

module.exports = Object.defineProperties(Enum, {
	DOMRadio: d(Radio),
	DOMSelect: d(Select),
	DOMMultipleInput: d(MultipleInput),
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
		} else {
			return new this.DOMSelect(document, this, options);
		}
	})
});
