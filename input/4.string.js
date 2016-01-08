'use strict';

var d           = require('d')
  , DOMTextarea = require('./_controls/textarea')

  , defineProperties = Object.defineProperties;

module.exports = function (db) {
	defineProperties(db.String, {
		DOMInput: d(DOMTextarea),
		inputSize: d(35), // for single line inputs
		inputCols: d(50), // for textareas
		inputRows: d(3) // for textareas
	});
};
