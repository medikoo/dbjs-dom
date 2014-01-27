'use strict';

var sepItems       = require('es5-ext/array/#/sep-items')
  , assign         = require('es5-ext/object/assign')
  , forEach        = require('es5-ext/object/for-each')
  , isPlainObject  = require('es5-ext/object/is-plain-object')
  , callable       = require('es5-ext/object/valid-callable')
  , d              = require('d/d')
  , autoBind       = require('d/auto-bind')
  , isObservable   = require('observable-value/is-observable')
  , exclude        = require('dom-ext/element/#/exclude')
  , include        = require('dom-ext/element/#/include')
  , replace        = require('dom-ext/element/#/replace')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , isNested       = require('dbjs/is-dbjs-nested-object')
  , DOMInput       = require('./_controls/input')
  , DOMRadio       = require('./_controls/radio')
  , DOMSelect      = require('./_controls/select')
  , DOMMultiple    = require('./_multiple/checkbox')
  , DOMComposite   = require('./_composite')

  , map = Array.prototype.map, defineProperties = Object.defineProperties
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select, Edit, Multiple, resolveDbOptions;

resolveDbOptions = function (type, options) {
	var list;
	if (options.list != null) {
		this.dbOptions = map.call(options.list, function (obj) {
			if (!obj || (obj.constructor !== type)) {
				throw new TypeError(obj + " is not a " + type.__id__);
			}
			return this.createOption(obj);
		}, this);
	} else {
		list = type.instances.toArray(options.compare);
		this.dbOptions = list.map(this.createOption, this);
		this.dbOptions.on('change', this.reload);
	}
};

Select = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	DOMSelect.call(this, document, type, options);
	this.property = options.property;
	resolveDbOptions.call(this, type, options);
	this.reload();
};
Select.prototype = Object.create(DOMSelect.prototype, assign({
	constructor: d(Select),
	createOption: d(function (obj) {
		var value;
		if (this.property) {
			value = obj._get(this.property);
			if (isObservable(value)) value = value.toDOM(this.document);
		} else {
			value = this.document.createTextNode(obj);
		}
		return createOption.call(this, obj.__id__, value);
	})
}, autoBind({
	reload: d(function () {
		replaceContent.call(this.control, this.chooseOption, this.dbOptions);
	})
})));

Radio = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	DOMRadio.call(this, document, type, options);
	this.dom.classList.add('object-list');
	this.property = options.property;
	resolveDbOptions.call(this, type, options);
	this.reload();
};
Radio.prototype = Object.create(DOMRadio.prototype, assign({
	constructor: d(Radio),
	createOption: d(function (obj) {
		return createRadio.call(this, obj.__id__,
			this.property ? obj._get(this.property).toDOM(this.document) :
					this.document.createTextNode(obj));
	})
}, autoBind({
	reload: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

Edit = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	if (options.render) this._render = callable(options.render);
	DOMComposite.call(this, document, type, options);
	if (options.render) delete this._render;
	this.objInput = this.dom.appendChild(this.make('input', { type: 'hidden' }));
	exclude.call(this.objInput);
};
Edit.prototype = Object.create(DOMComposite.prototype, {
	constructor: d(Edit),
	_render: d(function (options) {
		var el = this.make, props, desc = options.dbOptions
		  , obj = this.type.prototype;
		props = options.inputProperties || desc.inputProperties ||
			this.type.inputProperties ||
			this.type.prototype.toSet('key').toArray();
		this.dom = el('div', sepItems.call(props.map(function (name) {
			var observable = obj._get(name);
			return this.addItem(observable.toDOMInput(this.document,
				this.getOptions(observable.descriptor)), name);
		}, this), ' '));
	}),
	name: d.gs(getName, function (name) {
		this._name = name;
		name = this.name;
		if (name) {
			if (this.obj) {
				this.objInput.setAttribute('name', name);
			} else {
				forEach(this.items, function (item, propName) {
					item.name = name + '.' + propName;
				});
			}
		} else if (this.obj) {
			this.objInput.removeAttribute('name');
		} else {
			forEach(this.items, function (item) { item.name = null; });
		}
	}),
	value: d.gs(function () { return this.inputValue; }, function (value) {
		var obj;
		if (value === undefined) value = null;
		if (this.obj === value) return;
		obj = value || this.type.prototype;
		forEach(this.items, function (oldInput, name) {
			var nuInput, observable = obj._get(name);
			oldInput.destroy();
			nuInput = observable.toDOMInput(this.document,
				this.getOptions(observable.descriptor));
			replace.call(oldInput.dom, nuInput.dom);
			if (!value) nuInput.name = this.name + '.' + name;
			this.addItem(nuInput, name);
		}, this);
		if (value && !isNested(value)) {
			this.objInput.setAttribute('value', value.__id__);
			include.call(this.objInput);
		} else {
			this.objInput.removeAttribute('value');
			exclude.call(this.objInput);
		}
		this.obj = value;
		this.name = this._name;
	})
});

Multiple = function (document, type/*, options*/) {
	var options = Object(arguments[2]), getLabel, list, toData;

	getLabel = function (obj) {
		var label = options.itemLabel;
		if (typeof label === 'function') return label(obj);
		if (typeof label === 'string') return obj._get(label);
		return obj;
	};
	if (options.list) {
		list = options.list;
	} else {
		list = type.instances.toArray(options.sort);
	}
	toData = function (obj) {
		return { label: getLabel(obj), value: obj.__id__ };
	};
	this.dbList = list.map(toData);
	if (isObservable(this.dbList)) this.dbList.on('change', this.reload);
	DOMMultiple.call(this, document, type, options);
};

Multiple.prototype = Object.create(DOMMultiple.prototype, {
	constructor: d(Multiple)
});

module.exports = exports = function (db) {
	defineProperties(db.Object, {
		choosLabel: d("Choose:"),
		fromInputValue: d(function (value) {
			var empty;
			if (value == null) return null;
			if (isPlainObject(value)) {
				empty = true;
				forEach(value, function (subValue, name) {
					var sKey = this._serialize_(name)
					  , desc = this._getDescriptor_(sKey);
					subValue = desc.type.fromInputValue(subValue);
					value[name] = subValue;
					if (subValue != null) empty = false;
				}, this.prototype);
				return empty ? null : value;
			}
			value = value.trim();
			if (!value) return null;
			return this.getById(value);
		}),
		toInputValue: d(function (value) {
			if (value == null) return null;
			if (!this.is(value)) return null;
			return value.__id__;
		}),
		DOMRadio: d(Radio),
		DOMSelect: d(Select),
		DOMEdit: d(Edit),
		DOMInput: d(Select),
		DOMMultipleCheckbox: d(Multiple),
		toDOMInput: d(function (document/*, options*/) {
			var options = Object(arguments[1]);
			if (options.multiple) {
				if (options.type === 'checkbox') {
					return new Multiple(document, this, options);
				}
				return new this.DOMMultipleInput(document, this, options);
			}
			if (options.type === 'edit') {
				return new this.DOMEdit(document, this, options);
			}
			if (options.type === 'radio') {
				return new this.DOMRadio(document, this, options);
			}
			return new this.DOMInput(document, this, options);
		})
	});

	defineProperties(db.Object.$getOwn('chooseLabel'), {
		type: d('', db.String),
		required: d(true)
	});
};

exports.Select = Select;
exports.Radio = Radio;
exports.Edit = Edit;
exports.Multiple = Multiple;
