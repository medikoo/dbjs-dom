'use strict';

var noop     = require('es5-ext/lib/Function/noop')
  , d        = require('es5-ext/lib/Object/descriptor')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , map      = require('es5-ext/lib/Object/map')
  , Base     = require('dbjs').Base
  , DOMInput = require('./_controls/input')

  , Input;

module.exports = Input = function (rel, inputs, rels, dom) {
	this.inputs = inputs;
	this.relations = rels;
	this.fnValue = rel._value;
	this._name = rel._id_;
	this.required = rel.__required.__value;
	this.dom = dom;
	this.onchange = this.onchange.bind(this);
	forEach(this.inputs, function (input) {
		input.on('change', this.onchange);
	}, this);
	this.onchange();
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	value: d.gs(function () {
		return this.fnValue(map(this.inputs,
			function (input) { return input.value; }));
	}, noop)
});

Object.defineProperty(Base, 'DOMInputComponent', d(Input));
