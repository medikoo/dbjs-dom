'use strict';

var isDate   = require('es5-ext/date/is-date')
  , copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d/d')
  , DOMInput = require('./_controls/input')

  , DateTime = require('dbjs').DateTime
  , re = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/
  , castControlAttribute = DOMInput.prototype.castControlAttribute
  , Input;

Input = function (document, ns/*, options*/) {
	DOMInput.apply(this, arguments);
	this.control.addEventListener('input', this.onChange, false);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	controlAttributes: d(assign(copy(DOMInput.prototype.controlAttributes),
		{ autocomplete: true, list: true, max: true, min: true, readonly: true,
			required: true, step: true })),
	dbAttributes: d(assign(copy(DOMInput.prototype.dbAttributes),
		{ max: true, min: true, required: true, step: true })),
	dateAttributes: d({ min: true, max: true }),
	_render: d(function () {
		var input = this.control = this.dom = this.document.createElement('input');
		input.setAttribute('type', 'datetime-local');
	}),
	castControlAttribute: d(function (name, value) {
		if (this.dateAttributes[name] && isDate(value)) {
			value = this.ns.toInputValue(value);
		}
		castControlAttribute.call(this, name, value);
	})
});

module.exports = Object.defineProperties(DateTime, {
	fromInputValue: d(function (value) {
		var match, args;
		if (value == null) return null;
		value = value.trim();
		if (!value) return null;
		match = value.match(re);
		if (!match) return null;
		args = [Number(match[1]), Number(match[2]) - 1, Number(match[3]),
			match[4] ? Number(match[4]) : 0, match[5] ? Number(match[5]) : 0];
		if (this.prototype.validateCreate.apply(this.prototype, args)) {
			return null;
		}
		return this.prototype.create.apply(this.prototype, args);
	}),
	toInputValue: d(function (value) {
		return (value == null) ? null : value.toISOString().slice(0, 16);
	}),
	DOMInput: d(Input),
});
