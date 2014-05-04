'use strict';

var text  = require('./text')
  , input = require('./input');

module.exports = function (db) { return input(text(db)); };
