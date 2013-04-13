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
	dom = el('div', sepItems.call(this.fields.listByOrder().map(function (name) {
		var rel = rels[name] = this.get(name);
		return (inputs[name] = rel.toDOMInput(document, controlOpts));
	}, this.obj), (options.sep != null) ? options.sep : ' '));

	return new Input(this, inputs, rels, dom);
};

module.exports = function (rel) {
	defineProperty(rel, 'toDOMInput', d(toDOMInput));
};
