'use strict';

var CustomError    = require('es5-ext/lib/Error/custom')
  , noop           = require('es5-ext/lib/Function/noop')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , callable       = require('es5-ext/lib/Object/valid-callable')
  , memoize        = require('memoizee/lib/regular')
  , isNode         = require('dom-ext/lib/Node/is-node')
  , validDocument  = require('dom-ext/lib/Document/valid-document')
  , makeElement    = require('dom-ext/lib/Document/prototype/make-element')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , validSet       = require('set-collection/lib/valid-set')
  , Db             = require('dbjs')

  , map = Array.prototype.map
  , Base = Db.Base
  , cellName = { td: true, th: true }
  , Table;

require('memoizee/lib/ext/method');

module.exports = Table = function (document, set/*, options*/) {
	var options = Object(arguments[2]);
	this.document = validDocument(document);
	this.obj = validSet(set);

	this.render(options);

	// Columns
	if (options.columns != null) {
		this.cellRenderers = map.call(options.columns, function (options) {
			var name;
			if ((set._type_ === 'namespace') && (typeof options === 'string')) {
				name = options;
				if (this.head) {
					this.head.appendChild(
						this.headCellRender(set.prototype.get(name)._label)
					);
				}
				return function (item) { return item.get(name); };
			}
			if (this.head) {
				if (options.head) {
					this.head.appendChild(this.headCellRender(options.head));
				} else {
					this.head.appendChild(document.createElement('th'));
				}
			}
			if (options.render != null) {
				return callable(options.render);
			} else if (options.name != null) {
				name = String(options.name);
				return function (item) { return item.get(name); };
			} else {
				return noop;
			}
		}, this);
	} else if (set._type_ === 'namespace') {
		this.cellRenderers = set.prototype.getPropertyNames(options.tag)
			.listByOrder().map(function (name) {
				if (this.head) {
					this.head.appendChild(
						this.headCellRenderer(this.get(name)._label.toDOM(this.document))
					);
				}
				return function (item) { return item.get(name); };
			});
	} else {
		throw new CustomError("Columns layout not provided", 'MISSING_COLUMNS');
	}

	// Rows
	if (options.list) {
		if (options.list.obj !== set) {
			throw new CustomError("List doesn't match set", 'LIST_MISMATCH');
		}
		this.currentList = options.list;
		this.currentList.on('change', this.reload);
	} else if (options.compareFn) {
		if (!set.list) {
			throw new CustomError("No dynamic list spport", 'STATIC_SET');
		}
		this.currentList = set.list(options.compareFn);
		this.currentList.on('change', this.reload);
	} else if (set._type_ === 'namespace') {
		this.currentList = set.listByCreatedAt();
		this.currentList.on('change', this.reload);
	} else {
		this.currentList = set.values;
	}

	this.reload();
};

Object.defineProperties(Table.prototype, extend({
	render: d(function (options) {
		var el = makeElement.bind(this.document);
		this.dom = el('table',
			options.head ? el('thead', this.head = el('tr')) : null,
			this.body = el('tbody'));
	}),
	headCellRender: d(function (dom) {
		if (isNode(dom) && (dom.nodeName.toLowerCase() === 'th')) return dom;
		return makeElement.call(this.document, 'th', dom);
	}),
	cellRender: d(function (render, item) {
		var dom = render(item);
		if (isNode(dom) && cellName.hasOwnProperty(dom.nodeName.toLowerCase())) {
			return dom;
		}
		return makeElement.call(this.document, 'td', dom);
	}),
	toDOM: d(function () { return this.dom; })
}, memoize(function (item) {
	return makeElement.call(this.document, 'tr',
		this.cellRenderers.map(function (render) {
			return this.cellRender(render, item);
		}, this));
}, { method: 'rowRender' }), d.binder({
	reload: d(function () {
		replaceContent.call(this.body, this.currentList.map(this.rowRender));
	})
})));

Object.defineProperty(Base, 'DOMTable', d(Table));

Object.defineProperty(Db, 'toDOMTable', d(function (document/*, options*/) {
	return new Base.DOMTable(document, this, arguments[1]);
}));
