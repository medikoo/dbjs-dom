'use strict';

var CustomError = require('es5-ext/lib/Error/custom')
  , copy        = require('es5-ext/lib/Object/copy')
  , d           = require('es5-ext/lib/Object/descriptor')
  , getObject   = require('dbjs/lib/objects')._get

  , defineProperty = Object.defineProperty
  , getField, getRel, toDOMInput;

getField = function (rel, name, ns) {
	var field = rel['__' + name];
	if (field) field = field.__value;

	if (field == null) {
		throw new CustomError("Missing field name setting", 'NO_FIELD_SETTING');
	}
	return getRel(rel.obj, field, ns);
};

getRel = function (obj, name, ns) {
	var rel = obj.get(name);
	if ((rel.ns !== ns) && !ns.isPrototypeOf(rel.ns)) {
		throw new CustomError("Namespace mismatch", 'WRONG_NAMESPACE');
	}
	return rel;
};

toDOMInput = function (document/*, options*/) {
	var enumField = getField(this, 'enumField', getObject('Enum'))
	  , otherField = getField(this, 'otherField', getObject('StringLine'))
	  , options = Object(arguments[1]), dom, enumOpts, otherItem, otherInput;

	enumOpts = copy(options);
	enumOpts.type = 'radio';
	dom = enumField.toDOMInput(document, enumOpts);
	otherItem = dom.listItems.other.firstChild;
	if (!otherItem) {
		throw new CustomError("Other item not found", 'OTHER_NOT_FOUND');
	}
	otherItem.appendChild(document.createTextNode(': '));
	otherItem.appendChild(otherInput =
		otherField.toDOMInput(document, options).toDOM());

	dom.on('change', function () {
		otherInput.disabled = (dom.value !== 'other');
	});
	return dom;
};

module.exports = function (rel) {
	defineProperty(rel, 'toDOMInput', d(toDOMInput));
};
