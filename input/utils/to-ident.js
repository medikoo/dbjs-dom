'use strict';

var endsWith   = require('es5-ext/string/#/ends-with')
  , nonAsciiRe = /[\0-\/:-@\[-`{-\uffff]/g
  , dashRe     = /-{2,}/g;

module.exports = function (name) {
	name = name.replace(nonAsciiRe, '-').replace(dashRe, '-');
	if (endsWith.call(name, '-')) name = name.slice(0, -1);
	if (!name) name = 'x';
	return name;
};
