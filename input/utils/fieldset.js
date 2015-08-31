'use strict';

var assign          = require('es5-ext/object/assign')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , forEach         = require('es5-ext/object/for-each')
  , some            = require('es5-ext/object/some')
  , startsWith      = require('es5-ext/string/#/starts-with')
  , endsWith        = require('es5-ext/string/#/ends-with')
  , toArray         = require('es5-ext/array/to-array')
  , d               = require('d')
  , autoBind        = require('d/auto-bind')
  , memoize         = require('memoizee/plain')
  , isObservable    = require('observable-value/is-observable')
  , makeElement     = require('dom-ext/document/#/make-element')
  , castAttribute   = require('dom-ext/element/#/cast-attribute')
  , replaceContent  = require('dom-ext/element/#/replace-content')
  , resolveProperty = require('dbjs/_setup/utils/resolve-property-path')
  , DOMComposite    = require('../_composite')
  , htmlAttributes  = require('../_html-attributes')
  , setup           = require('../')

  , defineProperty = Object.defineProperty
  , getObservable, Fieldset;

getObservable = function (name) {
	var result = resolveProperty(this, name);
	return result.object.getObservable(result.key);
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

Object.defineProperties(Fieldset.prototype, assign({
	render: d(function () {
		var el = makeElement.bind(this.document);
		this.dom = el('fieldset', this.domItems = el('ul'));
	}),
	renderItem: d(function (observable) {
		var options = this.getOptions(observable.ownDescriptor), field, dom, li;
		field = observable.toDOMInputComponent(this.document, options);
		this.items[observable.dbId] = field;
		dom = field.toDOM(this.document);
		if (dom.nodeName.toLowerCase() === 'li') return dom;
		li = this.document.createElement('li');
		li.appendChild(dom);
		return li;
	}),
	// Allows to retrieve a generated item (field) by path string
	// (property path must end with provided path string)
	getItem: d(function (path) {
		var result = null;
		path = ensureString(path);
		if (this.items[path]) return this.items[path];
		if (path[0] !== '/') path = '/' + path;
		some(this.items, function (item, key) {
			if (endsWith.call(key, path)) {
				result = item;
				return true;
			}
		});
		return result;
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
