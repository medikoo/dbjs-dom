'use strict';

var isDate   = require('es5-ext/date/is-date')
  , copy     = require('es5-ext/object/copy')
  , assign   = require('es5-ext/object/assign')
  , d        = require('d')
  , DOMInput = require('./_controls/input')

  , defineProperties = Object.defineProperties, round = Math.round
  , re = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/
  , dayStep = 1000 * 60 * 60 * 24
  , castControlAttribute = DOMInput.prototype.castControlAttribute
  , Input;

Input = function (document, type/*, options*/) {
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
		if (this.dateAttributes[name]) {
			if (isDate(value)) value = this.type.toInputValue(value);
			else if (!isFinite(value)) value = null;
		}
		if ((name === 'step') && value && isFinite(value)) {
			value = round(value / dayStep);
			if (value === 1) value = null;
		}
		castControlAttribute.call(this, name, value);
	})
});

module.exports = exports = function (db) {
	defineProperties(db.DateTime, {
		fromInputValue: d(function (value) {
			var match;
			if (value == null) return null;
			value = value.trim();
			if (!value) return null;
			match = value.match(re);
			if (!match) return null;
			return this.normalize(new Date(Number(match[1]), Number(match[2]) - 1,
				Number(match[3]), match[4] ? Number(match[4]) : 0,
				match[5] ? Number(match[5]) : 0));
		}),
		toInputValue: d(function (value) {
			return (value == null) ? null : value.toISOString().slice(0, 16);
		}),
		DOMInput: d(Input)
	});
};

exports.Input = Input;
