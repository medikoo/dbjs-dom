'use strict';

var sepItems    = require('es5-ext/lib/Array/prototype/sep-items')
  , copy        = require('es5-ext/lib/Object/copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , makeElement = require('dom-ext/lib/Document/prototype/make-element')
  , Input       = require('../_component')

  , defineProperty = Object.defineProperty
  , toDOMInput;

toDOMInput = function (document/*, options*/) {
	var options = Object(arguments[1]), rels = {}, inputs = {}, controlOpts
	  , el = makeElement.bind(document), dom;

	controlOpts = copy(options);
	dom = el('div', sepItems.call(this.triggers.values.map(function (name) {
		rels[name] = this.get(name);
	}, this.obj).sort(function (a, b) {
		return a.__order.__value - b.__order.__value;
	}).map(function (rel) {
		return (inputs[rel.name] = rel.toDOMInput(document, controlOpts));
	}), (options.sep != null) ? options.sep : ' '));

	return new Input(this, inputs, rels, dom);
};

module.exports = function (rel) {
	defineProperty(rel, 'toDOMInput', d(toDOMInput));
};
