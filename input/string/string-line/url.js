'use strict';

var copy     = require('es5-ext/object/copy')
  , d        = require('es5-ext/object/descriptor')
  , extend   = require('es5-ext/object/extend')
  , DOMInput = require('../string-line').DOMInput

  , Url = require('dbjs/lib/objects')._get('Url')
  , Input;

require('../../');

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(extend(copy(DOMInput.prototype.controlAttributes),
		{ dirname: false, inputmode: false })),
	dbAttributes: d(extend(copy(DOMInput.prototype.dbAttributes),
		{ pattern: false })),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'url');
	}),
});

module.exports = Object.defineProperties(Url, {
	DOMInput: d(Input)
});
