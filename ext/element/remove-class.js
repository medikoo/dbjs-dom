'use strict';

var isObservableValue = require('observable-value/is-observable-value')
  , element           = require('dom-ext/element/valid-element')

  , prefix = '_dbjs:relation:class.';

module.exports = function (value) {
	element(this);
	if (!isObservableValue(value)) {
		this.classList.remove(value);
		return this;
	}
	if (!this.hasOwnProperty(prefix + value.dbId)) return;
	value.off('change', this[prefix + value.dbId]);
	delete this[prefix + value.dbId];
	value = value.value;
	if (value != null) this.classList.remove(value);
};
