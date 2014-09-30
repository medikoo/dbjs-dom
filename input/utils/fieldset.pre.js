'use strict';

var assign            = require('es5-ext/object/assign')
  , forEach           = require('es5-ext/object/for-each')
  , startsWith        = require('es5-ext/string/#/starts-with')
  , toArray           = require('es5-ext/array/to-array')
  , d                 = require('d')
  , autoBind          = require('d/auto-bind')
  , memoize           = require('memoizee/plain')
  , isObservable      = require('observable-value/is-observable')
  , makeElement       = require('dom-ext/document/#/make-element')
  , castAttribute     = require('dom-ext/element/#/cast-attribute')
  , replaceContent    = require('dom-ext/element/#/replace-content')
  , getId             = require('dom-ext/html-element/#/get-id')
  , resolveObservable = require('./resolve-observable')
  , DOMComposite      = require('../_composite')
  , htmlAttributes    = require('../_html-attributes')
  , setup             = require('../')

  , defineProperty = Object.defineProperty
  , getObservable, Fieldset, renderRow, renderRowSpan;

getObservable = function (name) {
	return resolveObservable(this, name);
};

renderRow = function (input, options) {
	var el = makeElement.bind(input.document)
	  , id = getId.call(input.control || input.dom);
	return el('tr',
		// label
		el('th', el('label', { for: id }, options.label, options.label ? ':' : '')),
		// input
		el('td', input,
			// required mark
			el('span', { class: 'statuses' },
				(options.missingStatus !== false)
				? el('span', { class: 'status-missing' }, '★') : null,
				// validation status mark
				(options.okStatus !== false)
				? el('span', { class: 'status-ok' }, '✓') : null,
				(options.errorStatus !== false)
				? el('span', { class: 'status-error' }, '✕') : null),
			// error message
			el('span', { class: 'error-message error-message-' +
				input._name.replace(/[:#\/]/g, '-') }),
			// hint
			options.hint && el('p', { class: 'hint' }, options.hint)));
};

renderRowSpan = function (input, options) {
	var el = makeElement.bind(input.document)
	  , id = getId.call(input.control || input.dom);
	return el('tr',
		// label
		el('td', { colspan: 2 },
			el('p', el('label', { for: id }, options.label ? ':' : '')),
			// input
			el('div', input,
				el('span', { class: 'statuses' },
					// required mark
					el('span', { class: 'status-missing' }, '★'),
					// validation status mark
					el('span', { class: 'status-ok' }, '✓'),
					el('span', { class: 'status-error' }, '✕')),
				// error message
				el('span', { class: 'error-message error-message-' +
					input._name.replace(/[:#]/g, '-') }),
				// hint
				options.hint && el('p', { class: 'hint' }, options.hint))));
};

Fieldset = function (document, list/*, options*/) {
	var options = Object(arguments[2]);

	this.document = document;
	this.list = list;
	this.items = {};
	this.options = Object(options.control);
	this.customOptions = Object(options.controls);
	this.prepend = options.prepend;
	this.append = options.append;

	this.list = list.map(this.renderItem, this);
	if (isObservable(this.list)) this.list.on('change', this.reload);

	this.render();
	forEach(options, function (value, name) {
		if (!htmlAttributes[name] && !startsWith.call(name, 'data-')) return;
		castAttribute.call(this.dom, name, value);
	}, this);
	this.dom.classList.add('dbjs');
	this.dom._dbjsFieldset = this;

	this.reload();
};
Object.defineProperty(Fieldset, 'renderRow', d(renderRow));

Object.defineProperties(Fieldset.prototype, assign({
	render: d(function () {
		var el = makeElement.bind(this.document);
		this.dom = el('fieldset', el('table',
			this.domItems = el('tbody')));
	}),
	renderItem: d(function (observable) {
		var options = this.getOptions(observable.ownDescriptor);
		if (options.render == null) options.render = renderRow;
		else if (options.render === 'span') options.render = renderRowSpan;
		return (this.items[observable.dbId] =
			observable.toDOMInputComponent(this.document, options));
	}),
	toDOM: d(function () { return this.dom; }),
	getOptions: d(DOMComposite.prototype.getOptions)
}, autoBind({
	reload: d(function () {
		replaceContent.call(this.domItems, this.prepend, this.list, this.append);
	})
})));

module.exports = exports = memoize(function (db) {
	var proto = setup(db).Base.prototype;

	defineProperty(db.Base, 'DOMFieldset', d(Fieldset));

	defineProperty(proto, 'toDOMFieldset', d(function (document/*, options*/) {
		var options = Object(arguments[1]), data, names;

		if (options.names != null) {
			names = options.names;
			if (!names.map) names = toArray(names);
			data = names.map(getObservable, this);
		} else {
			data = this.toSet('key').toArray().map(getObservable, this);
		}

		if (options.include) {
			throw new TypeError("`include` option is (postponed). Fix it");
		}

		return new db.Base.DOMFieldset(document, data, options);
	}));
}, { normalizer: require('memoizee/normalizers/get-1')() });

exports.Fieldset = Fieldset;
