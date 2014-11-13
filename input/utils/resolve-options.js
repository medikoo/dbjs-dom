'use strict';

var copy             = require('es5-ext/object/copy')
  , normalizeOptions = require('es5-ext/object/normalize-options')

  , resolvedMark = { _optionsResolved: true };

module.exports = function (options, type) {
	if (options && options._optionsResolved) return copy(options);
	return normalizeOptions(type.inputOptions,
		options && options.dbOptions && options.dbOptions.inputOptions, options, resolvedMark);
};
