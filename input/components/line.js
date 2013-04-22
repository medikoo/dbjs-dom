'use strict';

var sepItems    = require('es5-ext/lib/Array/prototype/sep-items')
  , copy        = require('es5-ext/lib/Object/copy')
  , extend      = require('es5-ext/lib/Object/extend')
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
		return (rels[name] = this.get(name));
	}, this.obj).sort(function (a, b) {
		return a.__order.__value - b.__order.__value;
	}).map(function (rel) {
		var opts = controlOpts;
		if (rel.__label.__value) {
			opts = extend({ placeholder: rel.__label.__value }, opts);
		}
		return (inputs[rel.name] = rel.toDOMInput(document, opts));
	}), (options.sep != null) ? options.sep : ' '));

	return new Input(this, inputs, rels, dom);
};

module.exports = function (rel) {
	defineProperty(rel, 'toDOMInput', d(toDOMInput));
};
