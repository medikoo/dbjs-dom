'use strict';

var Db = require('../');

module.exports = Db;

require('./row');

Db.prototype.set('toDOMFieldset', function (document/*, options*/) {
	var options = Object(arguments[1]), names, container, rows, body;

	if (options.names != null) names = options.names;
	else names = this.getPropertyNames(options.tag);

	rows = Array.prototype.map.call(names, function (name) {
		var rel = this['_' + name];
		return (rel.ns === this.db.Base) ? null : rel;
	}, this).filter(Boolean).sort(function (relA, relB) {
		return relA.order - relB.order;
	}).map(function (rel) {
		return rel.toDOMInputRow(document, options.rowOptions);
	});

	if (!rows.length) return null;

	container = document.createElement('fieldset');
	container.setAttribute('class', 'dbjs');
	body = container.appendChild(document.createElement('table'))
		.appendChild(document.createElement('tbody'));
	rows.forEach(body.appendChild, body);

	return container;
});
