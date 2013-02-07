'use strict';

var copy           = require('es5-ext/lib/Object/copy')
  , d              = require('es5-ext/lib/Object/descriptor')
  , extend         = require('es5-ext/lib/Object/extend')
  , el             = require('dom-ext/lib/Document/prototype/make-element')
  , replaceContent = require('dom-ext/lib/Element/prototype/replace-content')
  , Db             = require('../')

  , map = Array.prototype.map
  , Base = Db.Base
  , Fieldset;

require('./fieldset-item');

module.exports = Fieldset = function (document, obj/*, options*/) {
	var options = Object(arguments[2]);

	this.document = document;
	this.obj = obj;
	this.options = options;

	if (options.names != null) {
		this.names = options.names;
	} else {
		this.names = obj.getPropertyNames(options.tag);
	}
	if (this.names._isSet_) {
		if (this.names.listByOrder) {
			this.items = this.names.listByOrder().liveMap(this.renderItem, this);
		} else {
			this.items = this.names.values.map(this.renderItem, this);
		}
	} else {
		this.items = map.call(this.names, this.renderItem, this);
	}

	this.build();
	this.reload();

	if (this.items._isLiveList_) this.items.on('change', this.reload);

	this.dom.classList.add('dbjs');
};

Object.defineProperties(Fieldset.prototype, extend({
	build: d(function () {
		el = el.bind(this.document);
		this.dom = el('fieldset', el('table',
			this.domItems = el('tbody')));
	}),
	renderItem: d(function (name) {
		var controlOpts, rel = this.obj['_' + name];
		if (this.options.control) controlOpts = copy(this.options.control);
		if (this.options.controls && this.options.controls[name]) {
			controlOpts = extend(Object(controlOpts), this.options.controls[name]);
		}
		if (this.options.idPostfix != null) {
			controlOpts.id = rel.DOMId + this.options.idPostfix;
		}
		return rel.toDOMFieldsetItem(this.document, controlOpts);
	}),
	toDOM: d(function () { return this.dom; })
}, d.binder({
	reload: d(function () {
		replaceContent.call(this.domItems, this.items);
	})
})));

Object.defineProperty(Base, 'DOMFieldset', d(Fieldset));

Object.defineProperty(Db.prototype, 'toDOMFieldset',
	d(function (document/*, options*/) {
		return new Base.DOMFieldset(document, this, arguments[1]);
	}));
