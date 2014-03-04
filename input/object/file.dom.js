'use strict';

var aFrom        = require('es5-ext/array/from')
  , compact      = require('es5-ext/array/#/compact')
  , isCopy       = require('es5-ext/array/#/is-copy')
  , copy         = require('es5-ext/object/copy')
  , assign       = require('es5-ext/object/assign')
  , isObject     = require('es5-ext/object/is-object')
  , callable     = require('es5-ext/object/valid-callable')
  , toArray      = require('es6-iterator/to-array')
  , d            = require('d/d')
  , memoize      = require('memoizee/lib/regular')
  , memPrimitive = require('memoizee/lib/primitive')
  , makeEl       = require('dom-ext/document/#/make-element')
  , append       = require('dom-ext/element/#/append')
  , clear        = require('dom-ext/element/#/clear')
  , remove       = require('dom-ext/element/#/remove')
  , replaceCont  = require('dom-ext/element/#/replace-content')
  , dispatchEvnt = require('dom-ext/html-element/#/dispatch-event-2')
  , DOMInput     = require('../_controls/input')
  , eventOpts    = require('../_event-options')
  , setup        = require('../')

  , isArray = Array.isArray, map = Array.prototype.map
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , Input, render, renderItem, getTempForm, getForceReset;

require('memoizee/lib/ext/method');

getForceReset = memoize(function (document) {
	var form = document.createElement('form');
	return function (input) {
		var parent = input.parentNode, nextSibling = input.nextSibling;
		form.appendChild(input);
		form.reset();
		parent.insertBefore(input, nextSibling);
	};
});

getTempForm = memoize(function (document) {
	var form = document.createElement('form');
	form.setAttribute('method', 'post');
	form.setAttribute('enctype', 'multipart/form-data');
	form.setAttribute('style', 'display: none');
	return form;
});

render = function (options) {
	var el = this.make;
	return el('div', { class: 'dbjs-file' },
		this.valueDOM = this.multiple ? el('ul') : el('span'),
		el('label', { class: 'dbjs-file-input' }, options.label,
			this.control = el('input', { type: 'file' })));
};

renderItem = function (file) {
	var el = this.make, data = {};
	data.dom = el(this.multiple ? 'li' : 'span', { 'data-id': file.__id__ });
	append.call(data.dom,
		el('a', { href: file._url, target: '_blank' }, file._name), " ",
		data.control = el('input', { type: 'hidden', name: this.name,
			value: file.__id__ }),
		el('a', { class: 'clear', onclick: this.removeItem.bind(this, data.dom) },
			"x"));
	return data;
};

Input = function (document, type/*, options*/) {
	var options = arguments[2], action;
	this.make = makeEl.bind(document);
	this.controls = [];
	this.type = type;
	options = this._resolveOptions(options);
	if (options.multiple) this.multiple = true;
	((options.render == null) || callable(options.render));
	defineProperty(this, 'renderItem', d((options.renderItem == null)
		? renderItem : callable(options.renderItem)));
	DOMInput.call(this, document, type, options);
	if (this.multiple) this.control.setAttribute('multiple', 'multiple');
	this.control.setAttribute('accept', toArray(type.accept).join(','));

	if (options.autoSubmit != null) {
		action = options.autoSubmit;
		this.on('change', function () {
			var form, parent, sibling;
			if (!this.changed) return;
			form = getTempForm(document);
			parent = this.dom.parentNode;
			sibling = this.dom.nextSibling;
			form.setAttribute('action', action);
			document.body.appendChild(form);
			form.appendChild(this.dom);
			dispatchEvnt.call(form, 'submit');
			parent.insertBefore(this.dom, sibling);
			if (form.parentNode) form.parentNode.removeChild(form);
		});
	}
};

Input.prototype = Object.create(DOMInput.prototype, assign({
	constructor: d(Input),
	multiple: d(false),
	_value: d(null),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ required: true })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes),
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
			if (!this.valueDOM.firstElementChild) return null;
			return this.valueDOM.firstElementChild.getAttribute('data-id');
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
					if (this.control.files && this.control.files.length) {
						// In Opera control is not reset properly, force it with hack
						getForceReset(this.document)(this.control);
					}
					replaceCont.call(this.valueDOM, nu.map(this._renderItem));
					if (this._required) this.castControlAttribute('required', false);
					changed = true;
				}
			} else {
				clear.call(this.valueDOM);
				if (this._required) this.castControlAttribute('required', true);
			}
		} else if (nu !== old) {
			this.control.value = null;
			if (nu) {
				replaceCont.call(this.valueDOM, this._renderItem(nu));
				if (this._required) this.castControlAttribute('required', false);
				this.dom.classList.add('filled');
			} else {
				clear.call(this.valueDOM);
				if (this._required) this.castControlAttribute('required', true);
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
		if (this.multiple) return value.map(this.type.toInputValue, this.type);
		return this.type.toInputValue(value);
	}, function (value) {
		if (value == null) {
			value = null;
		} else if (this.multiple) {
			value = toArray(value);
			if (value.length) {
				value = compact.call(value.map(this.type.toInputValue, this.type));
			}
			if (!value.length) value = null;
		} else {
			value = this.type.toInputValue(value);
		}

		this.inputValue = value;
	}),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid;
		value = this.inputValue;
		changed = (this.multiple && (this._value != null) && (value != null))
			? isCopy.call(value, this._value) : (value !== this._value);
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
}, memPrimitive(function (file) {
	var data;
	file = this.type.getById(file);
	data = this.renderItem(file);
	this.controls.push(data.control);
	return data.dom;
}, { method: '_renderItem' })));

module.exports = memoize(function (db) {
	defineProperties(setup(db).File, {
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
			return this.getById(value);
		}),
		DOMInput: d(Input),
		toDOMInput: d(function (document/*, options*/) {
			var options = Object(arguments[1]);
			if (options.multiple || (options.type !== 'checkbox')) {
				return new this.DOMInput(document, this, options);
			}
			return db.Object.toDOMInput(document, options);
		})
	});
});

exports.Input = Input;
