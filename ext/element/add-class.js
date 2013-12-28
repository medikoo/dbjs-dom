'use strict';

var isObservableValue = require('observable-value/is-observable-value')
  , element           = require('dom-ext/element/valid-element')

  , prefix = '_dbjs:relation:class.';

module.exports = function (value) {
	var current;
	element(this);
	if (!isObservableValue(value)) {
		this.classList.add(value);
		return this;
	}
	if (this.hasOwnProperty(prefix + value.dbId)) return;
	current = value.value;
	if (current != null) this.classList.add(current);
	value.on('change', this[prefix + value.dbId] = function () {
		if (current != null) this.classList.remove(current);
		current = value.value;
		if (current != null) this.classList.add(current);
	}.bind(this));
};
