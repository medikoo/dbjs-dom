'use strict';

var text  = require('./text/enum')
  , input = require('./input/enum');

module.exports = function (Type) { return input(text(Type)); };
