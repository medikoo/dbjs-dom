'use strict';

var d           = require('d/d')
  , Db          = require('dbjs')
  , DOMTextarea = require('./_controls/textarea');

module.exports = Object.defineProperty(Db.String, 'DOMInput', d(DOMTextarea));
