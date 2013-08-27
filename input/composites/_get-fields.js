'use strict';

var CustomError = require('es5-ext/error/custom')
  , forEach     = require('es5-ext/object/for-each')
  , getObject   = require('dbjs/lib/objects')._get

  , getName, getRel;

getName = function (rel, name, ns) {
	var field = rel['__' + name];
	if (field) field = field.__value;

	if (field == null) {
		throw new CustomError("Missing field name setting", 'NO_FIELD_SETTING');
	}
	return field;
};

getRel = function (obj, name, ns) {
	var rel = obj.get(name);
	if ((rel.ns !== ns) && !ns.isPrototypeOf(rel.ns)) {
		throw new CustomError("Namespace mismatch", 'WRONG_NAMESPACE');
	}
	return rel;
};

module.exports = function (rel, data) {
	var result = { names: {}, rels: {} };
	forEach(data, function (ns, name) {
		var propName;
		ns = getObject(ns);
		result.names[name] = propName = getName(rel, name, ns);
		result.rels[propName] = getRel(rel.obj, propName, ns);
	});
	return result;
};
