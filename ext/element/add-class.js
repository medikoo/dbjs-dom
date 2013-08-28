'use strict';

var element = require('dom-ext/element/valid-element')

  , prefix = '_dbjs:relation:class.';

module.exports = function (value) {
	var current;
	element(this);
	if (!value || (value._type_ !== 'relation')) {
		this.classList.add(value);
		return this;
	}
	if (this.hasOwnProperty(prefix + value._id_)) return;
	current = value.objectValue;
	if (current != null) this.classList.add(current);
	value.on('change', this[prefix + value._id_] = function (nu, old) {
		if (current != null) this.classList.remove(current);
		current = value.objectValue;
		if (current != null) this.classList.add(current);
	}.bind(this));
};
