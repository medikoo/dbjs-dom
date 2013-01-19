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
		return ((rel.ns === this.db.Base) || (rel.ns === this.db.Function)) ? null :
				rel;
	}, this).filter(Boolean).sort(function (relA, relB) {
		return relA.order - relB.order;
	}).map(function (rel) {
		var controlOpts;
		if (options.control) controlOpts = this.plainCopy(options.control);
		if (options.controls && options.controls[rel.name]) {
			controlOpts = this.plainExtend(Object(controlOpts),
				options.controls[rel.name]);
		}
		return rel.__toDOMInputRow.__value.call(rel, document, controlOpts);
	}, this.db);

	if (!rows.length) return null;

	container = document.createElement('fieldset');
	container.setAttribute('class', 'dbjs');
	body = container.appendChild(document.createElement('table'))
		.appendChild(document.createElement('tbody'));
	rows.forEach(body.appendChild, body);

	return container;
});
