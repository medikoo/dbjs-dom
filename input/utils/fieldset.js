'use strict';

var CustomError    = require('es5-ext/lib/Error/custom')
  , copy           = require('es5-ext/lib/Object/copy')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , forEach        = require('es5-ext/lib/Object/for-each')
  , contains       = require('es5-ext/lib/String/prototype/contains')
  , makeElement    = require('dom-ext/lib/Document/prototype/make-element')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , SetCollection  = require('set-collection')
  , Db             = require('../')

  , map = Array.prototype.map
  , getRel = function (name) { return this.get(name); }
  , Base = Db.Base
  , Fieldset;

require('./fieldset-item');

module.exports = Fieldset = function (document, list/*, options*/) {
	var options = Object(arguments[2]), className;

	this.document = document;
	this.list = list;
	this.items = {};
	this.options = options;

	if (list.liveMap) {
		this.list = list.liveMap(this.renderItem, this);
		this.list.on('change', this.reload);
	} else {
		this.list = list.map(this.renderItem, this);
	}

	this.render();
	this.reload();

	this.dom.classList.add('dbjs');
	if (options.class != null) {
		className = String(options.class).trim();
		if (className) {
			className.split(' ').forEach(function (name) {
				this.add(name);
			}, this.dom.classList);
		}
	}
};

Object.defineProperties(Fieldset.prototype, extend({
	render: d(function () {
		var el = makeElement.bind(this.document);
		this.dom = el('fieldset', el('table',
			this.domItems = el('tbody')));
	}),
	renderItem: d(function (rel) {
		var controlOpts;
		if (this.options.control) controlOpts = copy(this.options.control);
		if (this.options.controls && this.options.controls[rel._id_]) {
			controlOpts = extend(Object(controlOpts),
				this.options.controls[rel._id_]);
		}
		if (this.options.idPostfix != null) {
			controlOpts.id = rel.DOMId + this.options.idPostfix;
		}
		return (this.items[rel._id_] =
			rel.toDOMFieldsetItem(this.document, controlOpts));
	}),
	toDOM: d(function () { return this.dom; })
}, d.binder({
	reload: d(function () {
		replaceContent.call(this.domItems, this.options.prepend, this.list,
			this.options.append);
	})
})));

Object.defineProperty(Base, 'DOMFieldset', d(Fieldset));

Object.defineProperty(Db.prototype, 'toDOMFieldset',
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

		if (options.controls) {
			forEach(options.controls, function (value, name, options) {
				if (contains.call(name, ':')) return;
				options[this._id_ + ':' + name] = value;
				delete options[name];
			}, this);
		}
		controlOpts = Object(options.controls);

		byOrder = function (a, b) {
			var aOpts = controlOpts[a._id_], bOpts = controlOpts[b._id_];
			a = (aOpts && !isNaN(aOpts.order)) ? aOpts.order : a.order;
			b = (bOpts && !isNaN(bOpts.order)) ? bOpts.order : b.order;
			return a - b;
		};

		if (data.list) {
			list = data.list(byOrder);
			list.forEach(setup = function (rel) {
				var opts = controlOpts[rel._id_];
				if (opts && !isNaN(opts.order)) return;
				rel._order.on('change', list._sort);
			});
			data.on('add', function (rel) {
				setup(rel);
				list._sort();
			});
			data.on('delete', function (rel) {
				var opts = controlOpts[rel._id_];
				if (opts && !isNaN(opts.order)) return;
				rel._order.off('change', list._sort);
			});
		} else {
			list = data.values.sort(byOrder);
		}

		return new Base.DOMFieldset(document, list, options);
	}));
