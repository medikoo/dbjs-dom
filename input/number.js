'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , Db       = require('dbjs')
  , DOMInput = require('./_controls/input')

  , isValidNumber = function (n) { return (n != null) && !isNaN(n); }
  , NumberType = Db.Number
  , Input, getOption;

getOption = function (name, options, def) {
	if (isValidNumber(options[name])) {
		return Number(options[name]);
	} else if (options.relation &&
			isValidNumber(options.relation['__' + name].__value)) {
		return Number(options.relation['__' + name].__value);
	}
	return def;
};

Input = function (document, ns/*, options*/) {
	var options = Object(arguments[2]), max, min, step;
	DOMInput.call(this, document, ns, options);
	this.control.setAttribute('type', 'number');
	max = getOption('max', options, ns.max);
	if ((max != null) && (max < Infinity)) this.control.setAttribute('max', max);
	min = getOption('min', options, ns.min);
	if ((min != null) && (min > -Infinity)) this.control.setAttribute('min', min);
	step = getOption('step', options, ns.step);
	if (step != null) this.control.setAttribute('step', step);
	this.control.addEventListener('input', this.onchange.bind(this), false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	knownAttributes: d({ class: true, id: true, required: true, style: true,
		placeholder: true })
});

module.exports = Object.defineProperties(NumberType, {
	fromInputValue: d(function (value) {
		value = value.trim();
		return (!value || isNaN(value)) ? null : Number(value);
	}),
	DOMInput: d(Input)
});
