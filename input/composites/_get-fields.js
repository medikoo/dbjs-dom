'use strict';

var customError = require('es5-ext/error/custom')
  , forEach     = require('es5-ext/object/for-each')

  , getName, getObservable;

getName = function (desc, name) {
	var field = desc[name];
	if (field == null) {
		throw customError("Missing field name setting", 'NO_FIELD_SETTING');
	}
	return field;
};

getObservable = function (obj, name, Type) {
	var observable = obj._get(name)
	  , observableType = observable.descriptor.type;
	if ((observableType !== Type) && !Type.isPrototypeOf(observableType)) {
		throw customError("Type mismatch", 'WRONG_TYPE');
	}
	return observable;
};

module.exports = function (obj, desc, data) {
	var result = { names: {}, observables: {} };
	forEach(data, function (Type, name) {
		var propName;
		result.names[name] = propName = getName(desc, name);
		result.observables[propName] = getObservable(obj, propName, Type);
	});
	return result;
};
