'use strict';

var CustomError    = require('es5-ext/lib/Error/custom')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , startsWith     = require('es5-ext/lib/String/prototype/starts-with')
  , makeElement    = require('dom-ext/lib/Document/prototype/make-element')
  , castAttribute  = require('dom-ext/lib/Element/prototype/cast-attribute')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , getId          = require('dom-ext/lib/HTMLElement/prototype/get-id')
  , SetCollection  = require('set-collection')
  , dbProto        = require('dbjs/lib/_proto')
  , Db             = require('../')
  , DOMComposite   = require('../_composite')
  , htmlAttributes = require('../_html-attributes')

  , map = Array.prototype.map
  , getRel = function (name) { return this.get(name); }
  , Base = Db.Base
  , Fieldset, renderRow, renderRowSpan;

renderRow = function (input, options) {
	var el = makeElement.bind(input.document)
	  , id = getId.call(input.control || input.dom);
	return el('tr',
		// label
		el('th', el('label', { for: id }, options.label, ':')),
		// input
		el('td', input,
			// required mark
			el('span', { class: 'required-status' }, '*'),
			// validation status mark
			el('span', { class: 'validation-status' }, '✓'),
			// error message
			el('span', { class: 'error-message error-message-' +
				input._name.replace(/[:#]/g, '-') }),
			// hint
			options.hint && el('p', { 'class': 'hint' }, options.hint)));
};

renderRowSpan = function (input, options) {
	var el = makeElement.bind(input.document)
	  , id = getId.call(input.control || input.dom);
	return el('tr',
		// label
		el('td', { colspan: 2 },
			el('p', el('label', { for: id }, options.label, ':')),
			// input
			el('div', input,
				// required mark
				el('span', { class: 'required-status' }, '*'),
				// validation status mark
				el('span', { class: 'validation-status' }, '✓'),
				// error message
				el('span', { class: 'error-message error-message-' +
					input._name.replace(/[:#]/g, '-') }),
				// hint
				options.hint && el('p', { 'class': 'hint' }, options.hint))));
};

module.exports = Fieldset = function (document, list/*, options*/) {
	var options = Object(arguments[2]);

	this.document = document;
	this.list = list;
	this.items = {};
	this.options = Object(options.control);
	this.customOptions = Object(options.controls);
	this.prepend = options.prepend;
	this.append = options.append;

	if (list.liveMap) {
		this.list = list.liveMap(this.renderItem, this);
		this.list.on('change', this.reload);
	} else {
		this.list = list.map(this.renderItem, this);
	}

	this.render();
	forEach(options, function (value, name) {
		if (!htmlAttributes[name] && !startsWith.call(name, 'data-')) return;
		castAttribute.call(this.dom, name, value);
	}, this);
	this.dom.classList.add('dbjs');

	this.reload();
};
Object.defineProperty(Fieldset, 'renderRow', d(renderRow));

Object.defineProperties(Fieldset.prototype, extend({
	render: d(function () {
		var el = makeElement.bind(this.document);
		this.dom = el('fieldset', el('table',
			this.domItems = el('tbody')));
	}),
	renderItem: d(function (rel) {
		var options = this.getOptions(rel);
		if (options.render == null) options.render = renderRow;
		else if (options.render === 'span') options.render = renderRowSpan;
		return (this.items[rel._id_] =
			rel.toDOMInputComponent(this.document, options));
	}),
	toDOM: d(function () { return this.dom; }),
	getOptions: d(DOMComposite.prototype.getOptions)
}, d.binder({
	reload: d(function () {
		replaceContent.call(this.domItems, this.prepend, this.list, this.append);
	})
})));

Object.defineProperty(Base, 'DOMFieldset', d(Fieldset));

Object.defineProperty(dbProto, 'toDOMFieldset',
	d(function (document/*, options*/) {
		var options = Object(arguments[1]), data, list, include, controlOpts
		  , setup, byOrder;

		if (options.names != null) {
			data = options.names._isSet_ ? options.names.values : options.names;
			data = new SetCollection(map.call(data, getRel, this));
		} else {
			data = this.getProperties(options.tag);
		}

		if (options.include) {
			if (options.include._type_ === 'relation') {
				include = new SetCollection();
				include.add(options.include);
			} else if (!options.include._isSet_) {
				include = new SetCollection(options.include);
			} else {
				include = options.include;
			}
			include.forEach(function (rel) {
				if (!rel || (rel._type_ !== 'relation')) {
					throw new CustomError("Include item must be a relation",
						'INVALID_RELATION');
				}
			});
			data = data.union(include);
		}

		controlOpts = Object(options.controls);

		byOrder = function (a, b) {
			var aOpts = controlOpts[a._id_] || controlOpts[a.name]
			  , bOpts = controlOpts[b._id_] || controlOpts[b.name];
			a = (aOpts && !isNaN(aOpts.order)) ? aOpts.order : a.order;
			b = (bOpts && !isNaN(bOpts.order)) ? bOpts.order : b.order;
			return a - b;
		};

		if (data.list) {
			list = data.list(byOrder);
			list.forEach(setup = function (rel) {
				var opts = controlOpts[rel._id_] || controlOpts[rel.name];
				if (opts && !isNaN(opts.order)) return;
				rel._order.on('change', list._sort);
			});
			data.on('add', function (rel) {
				setup(rel);
				list._sort();
			});
			data.on('delete', function (rel) {
				var opts = controlOpts[rel._id_] || controlOpts[rel.name];
				if (opts && !isNaN(opts.order)) return;
				rel._order.off('change', list._sort);
			});
		} else {
			list = data.values.sort(byOrder);
		}

		return new Base.DOMFieldset(document, list, options);
	}));
