'use strict';

var d           = require('d')
  , DOMTextarea = require('./_controls/textarea')

  , defineProperty = Object.defineProperty;

module.exports = function (db) {
	defineProperty(db.String, 'DOMInput', d(DOMTextarea));
};
