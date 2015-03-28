'use strict';

var aFrom          = require('es5-ext/array/from')
  , customError    = require('es5-ext/error/custom')
  , isFunction     = require('es5-ext/function/is-function')
  , invoke         = require('es5-ext/function/invoke')
  , noop           = require('es5-ext/function/noop')
  , assign         = require('es5-ext/object/assign')
  , oForEach       = require('es5-ext/object/for-each')
  , callable       = require('es5-ext/object/valid-callable')
  , validSet       = require('es6-set/valid-set')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , memoize        = require('memoizee/plain')
  , memoizeMethods = require('memoizee/methods-plain')
  , getNormalizer  = require('memoizee/normalizers/get-1')
  , ee             = require('event-emitter')
  , isNode         = require('dom-ext/node/is-node')
  , validDocument  = require('dom-ext/document/valid-document')
  , makeElement    = require('dom-ext/document/#/make-element')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , validDb        = require('dbjs/valid-dbjs')

  , isArray = Array.isArray, map = Array.prototype.map
  , forEach = Array.prototype.forEach
  , defineProperty = Object.defineProperty
  , cellName = { td: true, th: true }
  , sortByProperty, Table;

sortByProperty = memoize(function (name) {
	return function (a, b) {
		return String(a[name]).localeCompare(String(b[name]));
	};
});

Table = function (document, set/*, options*/) {
	var options = Object(arguments[2]), getList, classes;
	this.document = validDocument(document);
	this.el = makeElement.bind(this.document);
	this.set = this.obj = validSet(set);
	this.sortMethods = {};
	this.filterMethods = {};
	this.current = {};

	this.render(options);
	if (options.class != null) {
		classes = String(options.class);
		if (classes) {
			classes.split(' ').forEach(function (name) {
				this.add(name);
			}, this.dom.classList);
		}
	}

	// Columns
	if (options.columns != null) {

		// Sort methods
		forEach.call(options.columns, function (options, index) {
			var name;
			if (!options.sort) return;
			name = options.default ? '' : String(options.name || index);
			this.setSortMethod(name, options.sort, options.reverse);
			options.sortName = name;
		}, this);

		// Head
		if (this.head) {
			map.call(options.columns, function (options, index) {
				if (options.head) return this.headCellRender(options.head, options);
				return this.head.appendChild(document.createElement('th'));
			}, this).forEach(this.head.appendChild, this.head);
		}

		// Cells
		this.cellRenderers = map.call(options.columns, function (options, index) {
			var name, render = options.render || options.data;
			if (render != null) return callable(render);
			if (options.name != null) {
				name = String(options.name);
				return function (item) { return item._get(name); };
			}
			return noop;
		}, this);
	} else {
		throw customError("Columns layout not provided", 'MISSING_COLUMNS');
	}

	// Rows
	if (!this.sortMethods['']) {
		if (options.sort) {
			this.setSortMethod('', options.sort, options.reverse);
		} else {
			getList = invoke('toArray');
			this.sortMethods[''] = {
				getList: getList,
				reverse: false
			};
		}
	}

	this.reset();
};

ee(Object.defineProperties(Table.prototype, assign({
	reverse: d(false),
	render: d(function (options) {
		var el = makeElement.bind(this.document);
		this.dom = el('table', { class: 'dbjs' },
			options.head ? el('thead', this.head = el('tr')) : null,
			this.body = el('tbody'));
	}),
	headCellRender: d(function (dom, options) {
		if (isNode(dom) && (dom.nodeName.toLowerCase() === 'th')) return dom;
		return this.el('th', dom);
	}),
	cellRender: d(function (render, item) {
		var dom = render(item);
		if (isNode(dom) && cellName.hasOwnProperty(dom.nodeName.toLowerCase())) {
			return dom;
		}
		return makeElement.call(this.document, 'td', dom);
	}),
	setSortMethod: d(function (name, data, reverse) {
		var getList;
		if (typeof data === 'string') {
			getList = memoize(function (set) {
				return set.toArray(sortByProperty(data));
			}, { normalizer: getNormalizer() });
		} else if (isFunction(data)) {
			if (data.length === 1) {
				getList = memoize(data, { normalizer: getNormalizer() });
			} else {
				getList = memoize(function (set) { return set.toArray(data); },
					{ normalizer: getNormalizer() });
			}
		}
		return (this.sortMethods[name] = {
			getList: getList,
			reverse: Boolean(reverse)
		});
	}),
	setFilterMethod: d(function (name, cb) {
		this.filterMethods[name] = cb;
	}),
	reset: d(function (data) {
		var set;
		data = Object(data);
		oForEach(this.filterMethods, function (fn, name) {
			var filtered;
			if (data[name] == null) return;
			filtered = fn(data[name]);
			if (!filtered) return;
			if (set) set = set.and(filtered);
			else set = filtered;
		});
		if (set) this.set = set;
		else this.set = this.obj;
		this.sortBy(data.sort || '', data.reverse);
	}),
	sortBy: d(function (name, reverse) {
		var method;
		method = this.sortMethods[name] || this.sortMethods[''];
		reverse = Boolean(reverse);
		this.current.sort = name;
		this.current.reverse = reverse;
		if (method.reverse) reverse = !reverse;
		this.sort(method.getList(this.set), reverse);
	}),
	sort: d(function (list, reverse) {
		if (!isArray(list)) {
			throw customError("List must be an array", "ARRAY_EXPECTED");
		}
		reverse = Boolean(reverse);
		if ((this.list === list) && (this.reverse === reverse)) return;
		this.emit('change');
		if (this.list !== list) {
			if (this.list) this.list.off('change', this.onChange);
			list.on('change', this.onChange);
		}
		this.list = list;
		this.reverse = reverse;
		this.reload();
	}),
	emptyRow: d.gs(function () {
		defineProperty(this, 'emptyRow', d(this.el('tr', { class: 'empty' }, this.el('td',
			{ colspan: this.cellRenderers.length }, "No data"))));
		return this.emptyRow;
	}),
	toDOM: d(function () { return this.dom; })
}, memoizeMethods({
	rowRender: d(function (item) {
		return makeElement.call(this.document, 'tr',
			this.cellRenderers.map(function (render) {
				return this.cellRender(render, item);
			}, this));
	}, { getNormalizer: getNormalizer })
}), autoBind({
	onChange: d(function () { this.reload(); }),
	reload: d(function () {
		var list;
		if (this.list.length) {
			list = aFrom(this.list).map(this.rowRender);
			if (this.reverse) list = aFrom(list).reverse();
		} else {
			list = [this.emptyRow];
		}
		replaceContent.call(this.body, list);
	})
}))));

module.exports = exports = memoize(function (db) {
	defineProperty(validDb(db).Base, 'DOMTable', d(Table));
	defineProperty(db.Object, 'toDOMTable', d(function (document/*, options*/) {
		return new this.DOMTable(document, this.instances, arguments[1]);
	}));
}, { normalizer: getNormalizer() });

exports.Table = Table;
