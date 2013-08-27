'use strict';

var sepItems       = require('es5-ext/array/#/sep-items')
  , callable       = require('es5-ext/object/valid-callable')
  , d              = require('es5-ext/object/descriptor')
  , extend         = require('es5-ext/object/extend')
  , forEach        = require('es5-ext/object/for-each')
  , isPlainObject  = require('es5-ext/object/is-plain-object')
  , exclude        = require('dom-ext/lib/Element/prototype/exclude')
  , include        = require('dom-ext/lib/Element/prototype/include')
  , replace        = require('dom-ext/lib/Element/prototype/replace')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , ObjectType     = require('dbjs').Object
  , getObject      = require('dbjs/lib/objects')._get
  , DOMInput       = require('./_controls/input')
  , DOMRadio       = require('./_controls/radio')
  , DOMSelect      = require('./_controls/select')
  , DOMMultiple    = require('./_multiple/checkbox')
  , DOMComposite   = require('./_composite')

  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , StringLine = getObject('StringLine')
  , createOption = DOMSelect.prototype.createOption
  , createRadio = DOMRadio.prototype.createOption

  , Radio, Select, Edit, Multiple;

ObjectType.set('chooseLabel',
	StringLine.rel({ required: true, value: 'Choose:' }));

Select = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), list;
	DOMSelect.call(this, document, ns, options);
	this.property = options.property;
	list = (options.compare ? ns.list(options.compare) : ns.listByCreatedAt());
	this.dbOptions = list.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.reload);
	this.reload();
};
Select.prototype = Object.create(DOMSelect.prototype, extend({
	constructor: d(Select),
	createOption: d(function (obj) {
		return createOption.call(this, obj._id_,
			this.property ? obj.get(this.property).toDOM(this.document) :
					this.document.createTextNode(obj));
	})
}, d.binder({
	reload: d(function () {
		replaceContent.call(this.control, this.chooseOption, this.dbOptions);
	})
})));

Radio = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), list;
	DOMRadio.call(this, document, ns, options);
	this.dom.classList.add('object-list');
	this.property = options.property;
	list = (options.compare ? ns.list(options.compare) : ns.listByCreatedAt());
	this.dbOptions = list.liveMap(this.createOption, this);
	this.dbOptions.on('change', this.reload);
	this.reload();
};
Radio.prototype = Object.create(DOMRadio.prototype, extend({
	constructor: d(Radio),
	createOption: d(function (obj) {
		return createRadio.call(this, obj._id_,
			this.property ? obj.get(this.property).toDOM(this.document) :
					this.document.createTextNode(obj));
	})
}, d.binder({
	reload: d(function () { replaceContent.call(this.dom, this.dbOptions); })
})));

Edit = function (document, ns/*, options*/) {
	DOMComposite.apply(this, arguments);
	this.objInput = this.dom.appendChild(this.make('input', { type: 'hidden' }));
	exclude.call(this.objInput);
};
Edit.prototype = Object.create(DOMComposite.prototype, {
	constructor: d(Edit),
	_render: d(function (options) {
		var el = this.make, props, rel = options.dbOptions
		  , obj = this.ns.prototype;
		props = options.inputProperties || rel.inputProperties ||
			this.ns.inputProperties ||
			this.ns.prototype.getPropertyNames().listByOrder();
		this.dom = el('div', sepItems.call(props.map(function (name) {
			var rel = obj.get(name);
			return this.addItem(rel.toDOMInput(this.document, this.getOptions(rel)),
				name);
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
		obj = value || this.ns.prototype;
		forEach(this.items, function (oldInput, name) {
			var nuInput, rel = obj.get(name);
			oldInput.destroy();
			nuInput = rel.toDOMInput(this.document, this.getOptions(rel));
			replace.call(oldInput.dom, nuInput.dom);
			if (!value) nuInput.name = this.name + '.' + name;
			this.addItem(nuInput, name);
		}, this);
		if (value) {
			this.objInput.setAttribute('value', value._id_);
			include.call(this.objInput);
		} else {
			this.objInput.removeAttribute('value');
			exclude.call(this.objInput);
		}
		this.obj = value;
		this.name = this._name;
	})
});

Multiple = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), getLabel, list, toData;

	getLabel = function (obj) {
		var label = options.itemLabel;
		if (typeof label === 'function') return label(obj);
		if (typeof label === 'string') return obj.get(label);
		return obj;
	};
	if (options.list) {
		list = options.list;
	} else {
		list = ((options.sort != null) ? ns.list(callable(options.sort)) :
				ns.listByCreatedAt());
	}
	toData = function (obj) {
		return { label: getLabel(obj), value: obj._id_ };
	};
	if (list.liveMap) {
		this.dbList = list.liveMap(toData);
		this.dbList.on('change', this.reload);
	} else {
		this.dbList = list.map(toData);
	}
	DOMMultiple.call(this, document, ns, options);
};

Multiple.prototype = Object.create(DOMMultiple.prototype, {
	constructor: d(Multiple)
});

module.exports = Object.defineProperties(ObjectType, {
	fromInputValue: d(function (value) {
		var empty;
		if (value == null) return null;
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
		var id;
		if (value == null) return null;
		id = value._id_;
		if (!this.propertyIsEnumerable(id)) return null;
		if (this[id] !== value) return null;
		return id;
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
