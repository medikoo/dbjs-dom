'use strict';

require('../');

var relation = require('dbjs/lib/_relation');

require('../../text');

relation.set('toDOMInputRow', function (document/*, options*/) {
	var container, labelBox, inputBox, id, classes, el, box
	  , options = Object(arguments[1]);
	id = this.DOMId + (options.idPostfix || '');
	container = document.createElement('tr');
	container.id = 'tr-' + id;
	classes = this.tags.values;
	if (this.required) classes.unshift('required');
	classes.unshift('dbjs');
	container.setAttribute('class', classes.join(' '));

	labelBox = container.appendChild(document.createElement('th'))
		.appendChild(document.createElement('label'));
	labelBox.setAttribute('for', 'input-' + id);
	inputBox = container.appendChild(document.createElement('td'));
	labelBox.appendChild(this._label.toDOM(document));
	labelBox.appendChild(document.createTextNode(':'));
	box = this.toDOMInputBox(document, options);
	box.setAttribute('id', 'input-' + id);
	inputBox.appendChild(box.dom);
	if (this.required) {
		el = inputBox.appendChild(document.createElement('span'));
		el.setAttribute('class', 'required-icon');
		el.appendChild(document.createTextNode(' *'));
	}
	el = inputBox.appendChild(document.createElement('span'));
	el.setAttribute('id', 'error-' + id);
	el.setAttribute('class', 'error-message');
	if (this.fieldHint) {
		el = inputBox.appendChild(document.createElement('p'));
		el.setAttribute('class', 'hint');
		el.appendChild(this._fieldHint.toDOM(document));
	}
	return container;
});
