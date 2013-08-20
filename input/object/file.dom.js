'use strict';

var aFrom        = require('es5-ext/lib/Array/from')
  , compact      = require('es5-ext/lib/Array/prototype/compact')
  , isCopy       = require('es5-ext/lib/Array/prototype/is-copy')
  , copy         = require('es5-ext/lib/Object/copy')
  , extend       = require('es5-ext/lib/Object/extend')
  , d            = require('es5-ext/lib/Object/descriptor')
  , isObject     = require('es5-ext/lib/Object/is-object')
  , callable     = require('es5-ext/lib/Object/valid-callable')
  , memoize      = require('memoizee/lib/primitive')
  , makeEl       = require('dom-ext/lib/Document/prototype/make-element')
  , append       = require('dom-ext/lib/Element/prototype/append')
  , clear        = require('dom-ext/lib/Element/prototype/clear')
  , remove       = require('dom-ext/lib/Element/prototype/remove')
  , replaceCont  = require('dom-ext/lib/Element/prototype/replace-content')
  , dispatchEvnt = require('dom-ext/lib/HTMLElement/prototype/dispatch-event-2')
  , ObjectType   = require('dbjs').Object
  , serialize    = require('dbjs/lib/utils/serialize')
  , DOMInput     = require('../_controls/input')
  , eventOpts    = require('../_event-options')

  , isArray = Array.isArray, map = Array.prototype.map
  , defineProperty = Object.defineProperty
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , File = require('dbjs/lib/objects')._get('File')
  , Input, render, renderItem;

require('../');
require('memoizee/lib/ext/method');

render = function (options) {
	var el = this.make;
	return el('div', { class: 'dbjs-file' },
		this.valueDOM = this.multiple ? el('ul') : el('span'),
		el('label', { class: 'dbjs-file-input' }, options.label,
			this.control = el('input', { type: 'file' })));
};

renderItem = function (file) {
	var el = this.make, data = {};
	data.dom = el(this.multiple ? 'li' : 'span', { 'data-id': file._id_ });
	append.call(data.dom,
		el('a', { href: file._url, target: '_blank' }, file._name), " ",
		data.control = el('input', { type: 'hidden', name: this.name,
			value: file._id_ }),
		el('a', { class: 'clear', onclick: this.removeItem.bind(this, data.dom) },
			"x"));
	return data;
};

Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]);
	this.make = makeEl.bind(document);
	this.controls = [];
	if (options.multiple) this.multiple = true;
	((options.render == null) || callable(options.render));
	defineProperty(this, 'renderItem', d((options.renderItem == null) ?
			renderItem : callable(options.renderItem)));
	DOMInput.call(this, document, ns, options);
	if (this.multiple) this.control.setAttribute('multiple', 'multiple');
	this.control.setAttribute('accept', ns.accept.values.join(','));
};

Input.prototype = Object.create(DOMInput.prototype, extend({
	constructor: d(Input),
	multiple: d(false),
	_value: d(null),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ required: true })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
		{ required: true })),
	_render: d(function (options) {
		this.dom = (options.render || render).call(this, options);
		this.controls.push(this.control);
	}),
	name: d.gs(getName, function (name) {
		this._name = name;
		name = this.name;
		this.controls.forEach(function (input) { input.name = name; });
	}),
	inputValue: d.gs(function () {
		var value;
		if (!this.multiple) {
			if (this.control.files[0]) return this.control.files[0];
			if (!this.valueDOM.firstChild) return null;
			return this.valueDOM.firstChild.getAttribute('data-id');
		}
		value = map.call(this.valueDOM.childNodes, function (node) {
			var id = node.getAttribute('data-id');
			if (!id) {
				throw new TypeError("Missing id (data-id attribute) on file item");
			}
			return id;
		}).concat(aFrom(this.control.files));
		return value.length ? value : null;
	}, function (nu) {
		var old = this.inputValue, changed;
		this._value = nu;
		if (this.multiple) {
			if (nu) {
				if (!old || !isCopy.call(nu, old)) {
					this.control.value = null;
					replaceCont.call(this.valueDOM, nu.map(this._renderItem));
					changed = true;
				}
			} else {
				clear.call(this.valueDOM);
			}
		} else if (nu !== old) {
			this.control.value = null;
			if (nu) {
				replaceCont.call(this.valueDOM, this._renderItem(nu));
				this.dom.classList.add('filled');
			} else {
				clear.call(this.valueDOM);
				this.dom.classList.remove('filled');
			}
			changed = true;
		}
		if (changed) {
			try {
				dispatchEvnt.call(this.control, 'change', eventOpts);
			} catch (ignore) {}
		} else {
			this.onChange();
		}
	}),
	value: d.gs(function () {
		var value = this.inputValue;
		if (value == null) return null;
		if (this.multiple) return value.map(this.ns.toInputValue, this.ns);
		return this.ns.toInputValue(value);
	}, function (value) {
		if (value == null) {
			value = null;
		} else if (this.multiple) {
			if (!value._isSet_) throw new TypeError("Expected set value");
			if (value._type_ === 'relation') {
				value = value.values.map(serialize).sort(function (a, b) {
					return value[a].order - value[b].order;
				}).map(function (key) { return value[key]._subject_; });
			} else {
				value = value.values;
			}
			if (!value.length) value = null;
			else value = compact.call(value.map(this.ns.toInputValue, this.ns));
		} else {
			value = this.ns.toInputValue(value);
		}

		this.inputValue = value;
	}),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid;
		value = this.inputValue;
		changed = (this.multiple && (this._value != null) && (value != null)) ?
				isCopy.call(value, this._value) : (value !== this._value);
		valid = this.required ? (value != null) : true;

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
	removeItem: d(function (dom) {
		remove.call(dom);
		if (!this.multiple) this.dom.classList.remove('filled');
		dispatchEvnt.call(this.control, 'change', eventOpts);
	})
}, memoize(function (file) {
	var data;
	file = File[file];
	data = this.renderItem(file);
	this.controls.push(data.control);
	return data.dom;
}, { method: '_renderItem' })));

module.exports = Object.defineProperties(File, {
	fromInputValue: d(function (value) {
		if (value == null) return null;
		if (isArray(value) && (value.length === 2)) {
			if (typeof value[0] === 'string') {
				if (isObject(value[1])) return value[1];
			} else if (typeof value[1] === 'string') {
				if (isObject(value[0])) return value[0];
			}
			return value;
		}
		if (isObject(value)) return value;
		value = value.trim();
		if (!value) return null;
		if (!this.propertyIsEnumerable(value)) return null;
		if (this[value]._id_ !== value) return null;
		return this[value];
	}),
	DOMInput: d(Input),
	toDOMInput: d(function (document/*, options*/) {
		var options = Object(arguments[1]);
		if (options.multiple || (options.type !== 'checkbox')) {
			return new this.DOMInput(document, this, options);
		}
		return ObjectType.toDOMInput(document, options);
	})
});
