'use strict';

var value         = require('es5-ext/object/valid-value')
  , unserializeId = require('dbjs/_setup/unserialize/id')
  , object        = require('dbjs/valid-dbjs-object')
  , nested        = require('dbjs/valid-dbjs-nested-object');

module.exports = function (obj, id) {
	var names = [];
	object(obj);
	names = [];
	unserializeId(value(id)).forEach(function (token, index) {
		if (index % 2) {
			if (token !== '/') throw new TypeError(id + " is not property id");
			return;
		}
		names.push(token);
	});
	while (names.length > 1) obj = nested(obj[names.shift()]);
	return obj._get(names[0]);
};
