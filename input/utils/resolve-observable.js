'use strict';

var resolve = require('dbjs/_setup/utils/resolve-property-path');

module.exports = function (obj, id) {
	var result = resolve(obj, id);
	return result.object.getObservable(result.key);
};
