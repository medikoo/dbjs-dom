'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , Db          = require('dbjs')
  , DOMTextarea = require('./_controls/textarea');

module.exports = Object.defineProperty(Db.String, 'DOMInput', d(DOMTextarea));
