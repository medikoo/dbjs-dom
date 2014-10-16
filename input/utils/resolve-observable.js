'use strict';

var resolve = require('dbjs/_setup/utils/resolve-property-path');

module.exports = function (obj, id) {
	var result = resolve(obj, id);
	if (result.object.isKeyStatic(result.key)) return result.object[result.key];
	return result.object.getObservable(result.key);
};
