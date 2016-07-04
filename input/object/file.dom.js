'use strict';

var aFrom           = require('es5-ext/array/from')
  , compact         = require('es5-ext/array/#/compact')
  , isCopy          = require('es5-ext/array/#/is-copy')
  , pluck           = require('es5-ext/function/pluck')
  , copy            = require('es5-ext/object/copy')
  , assign          = require('es5-ext/object/assign')
  , isObject        = require('es5-ext/object/is-object')
  , callable        = require('es5-ext/object/valid-callable')
  , toArray         = require('es5-ext/array/to-array')
  , isMap           = require('es6-map/is-map')
  , d               = require('d')
  , autoBind        = require('d/auto-bind')
  , memoize         = require('memoizee/plain')
  , memoizeMethods  = require('memoizee/methods-plain')
  , getNormalizer   = require('memoizee/normalizers/get-1')
  , makeEl          = require('dom-ext/document/#/make-element')
  , append          = require('dom-ext/element/#/append')
  , clear           = require('dom-ext/element/#/clear')
  , remove          = require('dom-ext/element/#/remove')
  , replaceCont     = require('dom-ext/element/#/replace-content')
  , dispatchEvnt    = require('dom-ext/html-element/#/dispatch-event-2')
  , isNested        = require('dbjs/is-dbjs-nested-object')
  , resolveOptions  = require('../utils/resolve-options')
  , DOMInput        = require('../_controls/input')
  , eventOpts       = require('../_event-options')
  , setup           = require('../')

  , getMapValue = pluck(1)
  , isArray = Array.isArray, map = Array.prototype.map
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getName = Object.getOwnPropertyDescriptor(DOMInput.prototype, 'name').get
  , filterEmpty = function (file) { return file.name || file.path; };

var getForceReset = memoize(function (document) {
	var form = document.createElement('form');
	return function (input) {
		var parent = input.parentNode, nextSibling = input.nextSibling;
		form.appendChild(input);
		form.reset();
		parent.insertBefore(input, nextSibling);
	};
}, { normalizer: getNormalizer() });

var getTempForm = memoize(function (document) {
	var form = document.createElement('form');
	form.setAttribute('method', 'post');
	form.setAttribute('enctype', 'multipart/form-data');
	form.setAttribute('style', 'display: none');
	return form;
}, { normalizer: getNormalizer() });

var render = function (options) {
	var el = this.make;
	return el('div', { class: 'dbjs-file' },
		this.valueDOM = this.multiple ? el('ul') : el('span'),
		el('label', { class: 'dbjs-file-input' }, options.label,
			this.control = el('input', { type: 'file' })));
};

var renderItem = function (file) {
	var el = this.make, data = {}, name;
	data.dom = el(this.multiple ? 'li' : 'span', { 'data-id': file.__id__ });
	if (isNested(file)) name = file.__id__;
	else name = this.descriptor.__valueId__ + '*7' + file.__id__;
	append.call(data.dom,
		el('a', { href: file._url, target: '_blank' }, file._name), " ",
		el('label', { class: 'clear' },
			el('input', { type: 'checkbox', name: name, value: '' }), "x"));
	return data;
};

var byNameLastModified = function (f1, f2) {
	f1 = this.getById(f1);
	if (f1) f1 = f1.getDescriptor('name')._lastOwnModified_;
	f2 = this.getById(f2);
	if (f2) f2 = f2.getDescriptor('name')._lastOwnModified_;
	return (f1 || Infinity) - (f2 || Infinity);
};

var Input = function (document, type/*, options*/) {
	var options = arguments[2], action, descriptor;
	this.make = makeEl.bind(document);
	this.controls = [];
	this.type = type;
	options = resolveOptions(options, type);
	if (options.multiple) this.multiple = true;
	((options.render == null) || callable(options.render));
	defineProperty(this, 'renderItem', d((options.renderItem == null)
		? renderItem : callable(options.renderItem)));
	DOMInput.call(this, document, type, options);
	if (this.multiple) this.control.setAttribute('multiple', 'multiple');
	if (this.observable) descriptor = this.observable.descriptor;
	this.control.setAttribute('accept',
		(descriptor && descriptor.accept) || toArray(type.accept).join(','));

	if (options.autoSubmit != null) {
		action = options.autoSubmit;
		this.dom.classList.add('auto-submit');
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
	if (this._required) this.castControlAttribute('required', true);
	this.valueDOM.addEventListener('change', this.onChange, false);
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
		var value, item;
		if (!this.multiple) {
			if (this.control.files && this.control.files[0]) return this.control.files[0];
			item = this.valueDOM.firstElementChild;
			if (!item) return null;
			if (item.classList.contains('empty')) return null;
			if (item.querySelector('input[type=checkbox]').checked) return null;
			return this.valueDOM.firstElementChild.getAttribute('data-id');
		}
		value = compact.call(map.call(this.valueDOM.childNodes, function (item) {
			var id;
			if (item.classList.contains('empty')) return null;
			if (item.querySelector('input[type=checkbox]').checked) return null;
			id = item.getAttribute('data-id');
			if (!id) throw new TypeError("Missing id (data-id attribute) on file item");
			return id;
		})).concat(this.control.files ? aFrom(this.control.files) : []);
		return value.length ? value : null;
	}, function (nu) {
		var old = this.inputValue, changed;
		this._value = nu;
		if (this.multiple) {
			if (nu) {
				replaceCont.call(this.valueDOM,
					nu.sort(byNameLastModified.bind(this.type)).map(this._renderItem));
				if (this._required) this.castControlAttribute('required', false);
				changed = true;
				this.dom.classList.add('filled');
				this.control.value = null;
			} else {
				this.control.value = null;
				clear.call(this.valueDOM);
				if (this._required) this.castControlAttribute('required', true);
				this.dom.classList.remove('filled');
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
		this.updateRequired();
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
			if (isMap(value)) value = toArray(value).map(getMapValue).filter(filterEmpty);
			else value = toArray(value);
			if (value.length) {
				value = compact.call(value.map(this.type.toInputValue, this.type));
			}
			if (!value.length) value = null;
		} else {
			if (this.observable.descriptor.nested) value._name.on('change', this.onChange);
			value = this.type.toInputValue(value);
		}

		this.inputValue = value;
	}),
	updateRequired: d(function () {
		if (!this._required) return;
		this.castControlAttribute('required',
			aFrom(this.valueDOM.querySelectorAll('input[type=checkbox]')).every(function (input) {
				return input.checked;
			}));
	}),
	onChange: d(function () {
		var value, changed, valid, emitChanged, emitValid, isRequired;
		if (this.control.form) {
			if (this.form !== this.control.form) {
				if (this.form) this.form.removeEventListener('reset', this._onReset, false);
				this.form = this.control.form;
				this.form.addEventListener('reset', this._onReset, false);
			}
		}
		value = this.inputValue;
		changed = aFrom(this.valueDOM.querySelectorAll('input[type=checkbox]')).some(function (input) {
			return input.checked;
		});
		changed = (this.multiple && (this._value != null) && (value != null))
			? isCopy.call(value, this._value) : (value !== this._value);
		if (this.required) isRequired = true;
		else if (this.observable) isRequired = this.observable.descriptor.required;
		valid = isRequired ? (value != null) : true;

		if (this.changed !== changed) {
			this.changed = changed;
			emitChanged = true;
		}
		if (this.valid !== valid) {
			this.valid = valid;
			emitValid = true;
		}
		this.updateRequired();
		this.emit('change', value);
		if (emitChanged) this.emit('change:changed', this.changed);
		if (emitValid) this.emit('change:valid', this.valid);
	}),
	removeItem: d(function (dom) {
		remove.call(dom);
		if (!this.multiple) this.dom.classList.remove('filled');
		dispatchEvnt.call(this.control, 'change', eventOpts);
	})
}, autoBind({
	_onReset: d(function () {
		this.control.value = null;
		if (this.control.files && this.control.files.length) {
			// In Opera control is not reset properly, force it with hack
			getForceReset(this.document)(this.control);
		}
		aFrom(this.valueDOM.querySelectorAll('input[type=checkbox]')).every(function (input) {
			input.checked = false;
		});
		this.onChange();
	})
}), memoizeMethods({
	_renderItem: d(function (file) {
		var data;
		file = this.type.getById(file);
		data = this.renderItem(file);
		if (data.control) this.controls.push(data.control);
		return data.dom;
	})
})));

module.exports = memoize(function (db) {
	defineProperties(setup(db).File, {
		fromInputValue: d(function (value) {
			if (value == null) return null;
			if (value === '') return null;
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
}, { normalizer: getNormalizer() });

exports.Input = Input;
