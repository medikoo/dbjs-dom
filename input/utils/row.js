'use strict';

require('../');

var relation = require('dbjs/lib/_relation');

require('../../text');

relation.set('toDOMInputRow', function (document/*, options*/) {
	var container, labelBox, inputBox, id, classes, el, box, label, toDOM
	  , validate, options = Object(arguments[1]);
	id = this.__DOMId._value.call(this) + (options.idPostfix || '');
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
	label = this._label;
	toDOM = label.__toDOM.__value;
	labelBox.appendChild(toDOM.call(label, document));
	labelBox.appendChild(document.createTextNode(':'));
	box = this.__toDOMInputBox.__value.call(this, document, options);
	box.setAttribute('id', 'input-' + id);
	inputBox.appendChild(box.dom);
	if (this.required) {
		el = inputBox.appendChild(document.createElement('span'));
		el.setAttribute('class', 'required-icon');
		el.appendChild(document.createTextNode(' *'));
	}
	el = inputBox.appendChild(document.createElement('span'));
	el.setAttribute('class', 'validated-icon');
	el.appendChild(document.createTextNode(' ✓ '));
	validate = function (el) {
		el.style.visibility =
			(!this.__required.__value || (this.__value == null)) ? 'hidden' : '';
	}.bind(this, el);
	validate();
	this.on('change', validate);
	el = inputBox.appendChild(document.createElement('span'));
	el.setAttribute('id', 'error-' + id);
	el.setAttribute('class', 'error-message');
	if (this.__fieldHint && this.__fieldHint.__value) {
		el = inputBox.appendChild(document.createElement('p'));
		el.setAttribute('class', 'hint');
		el.appendChild(this._fieldHint.toDOM(document));
	}
	return container;
});
