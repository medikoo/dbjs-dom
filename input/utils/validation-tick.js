'use strict';

require('../');

var relation = require('dbjs/lib/_relation');

relation.set('toDOMValidationTick', function (box) {
	var document, el, validateDb, validateControl, rel, relValidate;
	document = box.document;
	rel = this;
	relValidate = (rel.obj._type_ === 'object') ? this.validate.bind(this) :
			this.validateCreate.bind(this);
	el = document.createElement('span');
	el.setAttribute('class', 'validation-tick');
	el.appendChild(document.createTextNode(' ✓ '));

	if (this.obj._type_ === 'object') {
		validateDb = function () {
			var isValid = (!rel.__required.__value || (rel.__value != null));
			el.classList[isValid ? 'add' : 'remove']('db-valid');
			el.classList[isValid ? 'remove' : 'add']('db-invalid');
		};
		validateDb();
		this.on('change', validateDb);
	}

	validateControl = function () {
		var isValid = !relValidate(box.get());
		el.classList[isValid ? 'add' : 'remove']('valid');
		el.classList[isValid ? 'remove' : 'add']('invalid');
	};
	validateControl();
	box.dom.addEventListener('change', validateControl, false);
	box.dom.addEventListener('keyup', validateControl, false);
	return el;
});
