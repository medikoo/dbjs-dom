'use strict';

var element = require('dom-ext/element/valid-element')

  , prefix = '_dbjs:relation:class.';

module.exports = function (value) {
	element(this);
	if (!value || (value._type_ !== 'relation')) {
		this.classList.remove(value);
		return this;
	}
	if (!this.hasOwnProperty(prefix + value._id_)) return;
	value.off('change', this[prefix + value._id_]);
	delete this[prefix + value._id_];
	value = value.objectValue;
	if (value != null) this.classList.remove(value);
};
