'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , el       = require('dom-ext/lib/Document/prototype/make-element')
  , Db       = require('../')
  , relation = require('dbjs/lib/_relation')

  , apply = Function.prototype.apply
  , Base = Db.Base, FieldsetItem;

module.exports = FieldsetItem = function (document, relation/*, options*/) {
	var options = Object(arguments[2]), tags;
	this.document = document;
	this.relation = relation;
	this.id = this.relation.DOMId;
	if (options.idPostfix != null) this.id += options.idPostfix;

	this.input = this.relation.toDOMInput(this.document, options);
	this.build();

	this.dom.setAttribute('id', 'tr-' + this.id);
	this.dom.setAttribute('data-name', relation.name);
	tags = relation.__tags.values;
	if (tags.length) apply.call(this.dom.classList.add, this.dom.classList, tags);
	if (relation.__required.__value) this.dom.classList.add('required');
	this.dom.classList.add('dbjs');

	this.domLabel.setAttribute('for', 'input-' + this.id);
	this.input.castAttribute('id', 'input-' + this.id);

	this.domError.setAttribute('id', 'error-' + this.id);

	this.input.on('change:changed', function (status) {
		this.dom.classList[status ? 'add' : 'remove']('changed');
	}.bind(this));
	if (relation.__required.__value) {
		relation.on('change', function (nu, old) {
			if (((nu != null) && (old != null)) || (nu == old)) return; //jslint: skip
			this.dom.classList[(nu == null) ? 'add' : 'remove']('db-invalid');
		}.bind(this));
	}
	if (!relation.hasOwnProperty('_value')) {
		this.dom.classList.add('db-undefined');
	}
	relation.on('selfupdate', function (nu, old) {
		if (nu && old && (nu.value !== undefined) && (old.value !== undefined)) {
			return;
		}
		this.dom.classList[(!nu || (nu.value === undefined)) ? 'add' :
				'remove']('db-undefined');
	}.bind(this));
	this.input.on('change:valid', function (status) {
		this.dom.classList[status ? 'remove' : 'add']('invalid');
	}.bind(this));
};

Object.defineProperties(FieldsetItem.prototype, {
	build: d(function () {
		el = el.bind(this.document);
		this.dom = el('tr',
			// label
			el('th', this.domLabel = el('label', this.relation._label, ':')),
			// input
			el('td', this.input,
				// required mark
				this.relation.__required.__value ?
						el('span', { class: 'required-status' }, '*') : null,
				// validation status mark
				this.domValidation = el('span', { class: 'validation-status' }, '✓'),
				// error message
				this.domError = el('span', { class: 'error-message' }),
				// hint
				this.relation.__fieldHint.__value ?
						el('p', { 'class': 'hint' }, this.relation._fieldHint) : null));
	}),
	toDOM: d(function () { return this.dom; })
});

Object.defineProperty(Base, 'DOMFieldsetItem', d(FieldsetItem));

Object.defineProperty(relation, 'toDOMFieldsetItem',
	d(function (document/*, options*/) {
		return new Base.DOMFieldsetItem(document, this, arguments[1]);
	}));
