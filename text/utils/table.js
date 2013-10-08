'use strict';

var customError    = require('es5-ext/error/custom')
  , isFunction     = require('es5-ext/function/is-function')
  , invoke         = require('es5-ext/function/invoke')
  , noop           = require('es5-ext/function/noop')
  , assign         = require('es5-ext/object/assign-multiple')
  , oForEach       = require('es5-ext/object/for-each')
  , callable       = require('es5-ext/object/valid-callable')
  , d              = require('d/d')
  , autoBind       = require('d/auto-bind')
  , memoize        = require('memoizee/lib/regular')
  , ee             = require('event-emitter/lib/core')
  , isNode         = require('dom-ext/node/is-node')
  , validDocument  = require('dom-ext/document/valid-document')
  , makeElement    = require('dom-ext/document/#/make-element')
  , replaceContent = require('dom-ext/element/#/replace-content')
  , validSet       = require('set-collection/lib/valid-set')
  , stringify      = require('querystring-x/encode')
  , Db             = require('dbjs')

  , isArray = Array.isArray, map = Array.prototype.map
  , forEach = Array.prototype.forEach
  , defineProperty = Object.defineProperty
  , Base = Db.Base
  , cellName = { td: true, th: true }
  , Table;

require('memoizee/lib/ext/method');

module.exports = Table = function (document, set/*, options*/) {
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
			if (options.render != null) return callable(options.render);
			if (options.name != null) {
				name = String(options.name);
				return function (item) { return item.get(name); };
			}
			return noop;
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
		throw customError("Columns layout not provided", 'MISSING_COLUMNS');
	}

	// Rows
	if (!this.sortMethods['']) {
		if (options.sort) {
			this.setSortMethod('', options.sort, options.reverse);
		} else {
			if (set._type_ === 'namespace') getList = invoke('listByCreatedAt');
			else if (set.listByOrder) getList = invoke('listByOrder');
			else getList = invoke('list');
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
		var sortName;
		if (isNode(dom) && (dom.nodeName.toLowerCase() === 'th')) return dom;
		if (options.sortName != null) {
			sortName = options.sortName;
			this.on('change', function () {
				var data = {};
				if (sortName) data.sort = sortName;
				if ((this.current.sort === sortName) && !this.current.reverse) {
					data.reverse = true;
				}
				data = stringify(data);
				dom.setAttribute('href',  data ? '?' + data : '.');
			});
			dom = this.el('a', dom);
		}
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
			if (!this.obj.listByProperty) {
				throw customError("Property sort not supported",
					'NO_SET_NAME_SORT_SUPPORT');
			}
			getList = function (set) { return set.listByProperty(data); };
		} else if (isFunction(data)) {
			if (data.length === 1) {
				getList = memoize(data);
			} else {
				getList = memoize(function (set) { return set.list(data); });
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
			if (set) set = set.intersection(filtered);
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
		if (list.obj !== this.set) {
			throw customError("List doesn't match set", 'LIST_MISMATCH');
		}
		reverse = Boolean(reverse);
		if ((this.list === list) && (this.reverse === reverse)) return;
		this.emit('change');
		if (this.list !== list) {
			if (this.list) this.list.off('change', this.reload);
			list.on('change', this.reload);
		}
		this.list = list;
		this.reverse = reverse;
		this.reload();
	}),
	emptyRow: d.gs(function () {
		defineProperty(this, 'emptyRow', d(this.el('tr', this.el('td',
			{ colspan: this.cellRenderers.length, class: 'empty' }, "No data"))));
		return this.emptyRow;
	}),
	toDOM: d(function () { return this.dom; })
}, memoize(function (item) {
	return makeElement.call(this.document, 'tr',
		this.cellRenderers.map(function (render) {
			return this.cellRender(render, item);
		}, this));
}, { method: 'rowRender' }), autoBind({
	reload: d(function () {
		var list;
		if (this.list.length) {
			list = this.list.map(this.rowRender);
			if (this.reverse) list.reverse();
		} else {
			list = [this.emptyRow];
		}
		replaceContent.call(this.body, list);
	})
}))));

Object.defineProperty(Base, 'DOMTable', d(Table));

Object.defineProperty(Db, 'toDOMTable', d(function (document/*, options*/) {
	return new this.DOMTable(document, this, arguments[1]);
}));
