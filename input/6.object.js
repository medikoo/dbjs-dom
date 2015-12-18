'use strict';

var separate          = require('es5-ext/array/#/separate')
  , assign            = require('es5-ext/object/assign')
  , forEach           = require('es5-ext/object/for-each')
  , isPlainObject     = require('es5-ext/object/is-plain-object')
  , callable          = require('es5-ext/object/valid-callable')
  , validObject       = require('es5-ext/object/valid-object')
  , validValue        = require('es5-ext/object/valid-value')
  , memoize           = require('memoizee/plain')
  , memoizeMethods    = require('memoizee/methods-plain')
  , getNormalizer     = require('memoizee/normalizers/get-1')
  , d                 = require('d')
  , autoBind          = require('d/auto-bind')
  , isObservable      = require('observable-value/is-observable')
  , isObservableArray = require('observable-array/is-observable-array')
  , isObservableSet   = require('observable-set/is-observable-set')
  , clear             = require('dom-ext/element/#/clear')
  , exclude           = require('dom-ext/element/#/exclude')
  , include           = require('dom-ext/element/#/include')
  , replace           = require('dom-ext/element/#/replace')
  , replaceContent    = require('dom-ext/element/#/replace-content')
  , isNested          = require('dbjs/is-dbjs-nested-object')
  , resolveOptions    = require('./utils/resolve-options')
  , DOMInput          = require('./_controls/input')
  , DOMRadio          = require('./_controls/radio')
  , DOMSelect         = require('./_controls/select')
  , DOMMultiple       = require('./_multiple/checkbox')
  , DOMComposite      = require('./_composite')

  , map = Array.prototype.map, create = Object.create, defineProperties = Object.defineProperties
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption
  , getId = function (args) { return args[0].__id__; }

  , Radio, Select, Edit, Multiple, resolveDbOptions, getResolver;

getResolver = memoize(function (type) {
	return function (obj) {
		if (!obj || ((obj.constructor !== type) && !type.isPrototypeOf(obj.constructor))) {
			throw new TypeError(obj + " is not a " + type.__id__);
		}
		return obj;
	};
}, { normalizer: getNormalizer() });

resolveDbOptions = function (type, options) {
	var list = (typeof options.list === 'function') ? options.list.call(this, options) : options.list;
	if (list != null) {
		if (isObservableSet(list)) {
			this.dbOptions = list.toArray().map(getResolver(type), this);
		} else if (isObservableArray(list)) {
			this.dbOptions = list.map(getResolver(type), this);
		} else if (typeof list === 'function') {
			this.dbOptions = map.call(list, getResolver(type), this);
		} else {
			this.dbOptions = map.call(list, getResolver(type), this);
		}
	} else {
		this.dbOptions = type.instances.toArray(options.compare);
	}
	if (!this.group) this.dbOptions = this.dbOptions.map(this.createOption, this);
	if (typeof this.dbOptions.on !== 'function') return;
	this.dbOptions.on('change', this.reload);
};

Select = function (document, type/*, options*/) {
	var options = arguments[2];
	this.type = type;
	options = resolveOptions(options, type);
	DOMSelect.call(this, document, type, options);
	if (options.getOptionLabel != null) this.getOptionLabel = callable(options.getOptionLabel);
	else this.property = options.property;
	if (options.group != null) {
		this.group = validObject(options.group);
		validValue(this.group.propertyName);
	}
	resolveDbOptions.call(this, type, options);
	this.reload();
};
Select.prototype = Object.create(DOMSelect.prototype, assign({
	constructor: d(Select)
}, memoizeMethods({
	createOption: d(function (obj) {
		var value;
		if (this.getOptionLabel) {
			value = this.getOptionLabel(obj);
			if (isObservable(value)) value = value.toDOM(this.document);
		} else if (this.property) {
			value = obj._get(this.property);
			if (isObservable(value)) value = value.toDOM(this.document);
		} else {
			value = this.document.createTextNode(obj);
		}
		return createOption.call(this, obj.__id__, value);
	}, { normalizer: getId }),
	createOptgroup: d(function (obj) {
		var el = this.document.createElement('optgroup'), value;
		if (this.group.labelPropertyName) {
			value = obj._get(this.group.labelPropertyName);
			if (isObservable(value)) value = value.toDOMAttr(el, 'label');
			else el.setAttribute('label', value);
		} else {
			el.setAttribute('label', value);
		}
		return el;
	}, { normalizer: getId })
}), autoBind({
	reload: d(function () {
		var els, done, options = this.dbOptions;
		if (this.group) {
			els = [];
			done = create(null);
			options.forEach(function (obj) {
				var group = obj[this.group.propertyName], optgroup, option;
				if (!group) {
					console.warn("No group found for", obj.__id__, "searched by", this.group.propertyName);
					return;
				}
				optgroup = this.createOptgroup(group);
				option = this.createOption(obj);
				if (!done[group.__id__]) {
					clear.call(optgroup);
					done[group.__id__] = true;
					els.push(optgroup);
				}
				optgroup.appendChild(option);
			}, this);
		} else {
			els = options;
		}
		replaceContent.call(this.control, this.chooseOption, els);
	})
})));

Radio = function (document, type/*, options*/) {
	var options = arguments[2];
	this.type = type;
	options = resolveOptions(options, type);
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
	var options = arguments[2];
	this.type = type;
	options = resolveOptions(options, type);
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
		this.dom = el('div', { class: 'inputs' }, separate.call(props.map(function (name) {
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
	var options = arguments[2], getLabel, list, toData;

	this.type = type;
	options = resolveOptions(options, type);
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
			var empty, result, owner, index, resolvedPath;
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
			result = this.getById(value);
			if (result) return result;
			if (db.objects.getById(value)) return null;
			// If it's about nested, it might be that it's not loaded into memory
			// Below logic ensures it's retrieved properly
			index = value.indexOf('/');
			if (index === -1) return null;
			owner = db.objects.getById(value.slice(0, index));
			if (!owner) return null;
			resolvedPath = owner.resolveSKeyPath(value.slice(index + 1));
			if (!resolvedPath) return null;
			value = resolvedPath.value;
			if (value && (value instanceof this)) return value;
			return null;
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
