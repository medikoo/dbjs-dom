'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('../_controls/input')

  , StringLine = require('dbjs/lib/objects')._get('StringLine')
  , Input;

require('../');

Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), pattern, mask;
	DOMInput.call(this, document, ns, options);
	this.dom.setAttribute('type', 'text');

	if (options.relation && options.relation.__pattern.__value) {
		pattern = Db.RegExp(options.relation.__pattern.__value);
	}
	if (!pattern) pattern = ns.pattern;
	this.dom.setAttribute('pattern', pattern.source.slice(1, -1));

	if (options.relation && options.relation.__mask &&
			options.relation.__mask.__value) {
		mask = StringLine(options.relation.__mask.__value);
	}
	if (!mask) mask = ns.mask;
	if (mask) this.dom.setAttribute('data-mask', mask);

	if (ns.max) this.dom.setAttribute('maxlength', ns.max);
	this.dom.addEventListener('input', this.onchange.bind(this), false);
	this.dom.addEventListener('keyup', this.onchange.bind(this), false);
};
Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	knownAttributes: d({ class: true, id: true, required: true, style: true,
		placeholder: true })
});

module.exports = Object.defineProperty(StringLine, 'DOMInput', d(Input));
